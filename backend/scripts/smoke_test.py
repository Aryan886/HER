import asyncio
import os
import sys
import tempfile
from pathlib import Path

import httpx


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


async def run() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "her-smoke.db"
        os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path.as_posix()}"
        os.environ["GEMINI_API_KEY"] = ""

        from config import get_settings

        get_settings.cache_clear()

        from database import engine, init_db
        from main import app

        try:
            await init_db()

            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                user_id = "smoke-user"

                symptom_response = await client.post(
                    "/api/symptoms/log",
                    json={
                        "userId": user_id,
                        "rawText": (
                            "I have severe pelvic cramping around my period for 8 months, "
                            "worse after standing and not helped by rest."
                        ),
                    },
                )
                symptom_response.raise_for_status()
                symptom = symptom_response.json()

                symptom["severity"] = 9
                symptom["duration"] = "8 months"
                symptom["aggravatingFactors"] = ["Standing"]
                symptom["relievingFactors"] = ["Rest does not help"]
                confirm_response = await client.put(
                    f"/api/symptoms/{symptom['id']}",
                    json=symptom,
                )
                confirm_response.raise_for_status()
                confirmed = confirm_response.json()
                assert confirmed["severity"] == 9
                assert confirmed["duration"] == "8 months"

                visit_response = await client.post(
                    "/api/visits/log",
                    json={
                        "userId": user_id,
                        "visitDate": "2026-08-10",
                        "doctorName": "Dr. Smoke Test",
                        "specialty": "GP",
                        "notes": "Smoke-test visit.",
                        "symptoms": [
                            {
                                "symptomId": symptom["id"],
                                "outcome": "dismissed",
                                "outcomeNote": "No investigation ordered.",
                            }
                        ],
                    },
                )
                visit_response.raise_for_status()
                visit = visit_response.json()
                assert visit["dismissalRate"] == 1.0

                dashboard_response = await client.get(f"/api/dashboard?user_id={user_id}")
                dashboard_response.raise_for_status()
                dashboard = dashboard_response.json()
                assert dashboard["totalSymptoms"] == 1
                assert dashboard["totalVisits"] == 1
                assert dashboard["overallDismissalRate"] == 1.0

                summary_response = await client.get(f"/api/summary/generate?user_id={user_id}")
                summary_response.raise_for_status()
                summary = summary_response.json()
                assert summary["dismissalSummary"]["totalDismissed"] == 1
                assert len(summary["symptomTimeline"]) == 1
        finally:
            await engine.dispose()

    print("Backend smoke test passed.")


if __name__ == "__main__":
    asyncio.run(run())
