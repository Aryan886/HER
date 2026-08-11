import asyncio
import json
import unittest
from datetime import date, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from config import get_settings
from services import llm_service


def _set_gemini_env() -> None:
    get_settings.cache_clear()
    llm_service.get_settings.cache_clear()


class LLmServiceTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.env_patch = patch.dict(
            "os.environ",
            {"GEMINI_API_KEY": "test-key", "GEMINI_MODEL": "gemini-2.5-flash"},
            clear=False,
        )
        self.env_patch.start()
        _set_gemini_env()

    def tearDown(self) -> None:
        self.env_patch.stop()
        _set_gemini_env()

    async def test_extract_symptom_fields_uses_structured_response(self) -> None:
        payload = {
            "clinical_text": "Patient reports cyclical pelvic pain.",
            "body_location": "Pelvis",
            "symptom_type": "Pelvic pain / Dysmenorrhea",
            "duration": "8 months",
            "severity": 8,
            "onset_pattern": "Cyclical",
            "aggravating_factors": ["Standing"],
            "relieving_factors": ["Heat"],
        }
        with patch.object(llm_service, "_generate_with_gemini", AsyncMock(return_value=json.dumps(payload))) as mock_call:
            result = await llm_service.extract_symptom_fields("Pelvic pain for 8 months.")

        self.assertEqual(result["symptom_type"], payload["symptom_type"])
        self.assertEqual(result["aggravating_factors"], ["Standing"])
        self.assertEqual(result["relieving_factors"], ["Heat"])
        mock_call.assert_awaited_once()

    async def test_generate_clinical_narrative_returns_provider_text(self) -> None:
        symptoms, visits = _sample_summary_data()
        with patch.object(
            llm_service,
            "_generate_with_gemini",
            AsyncMock(return_value="Concise clinical narrative."),
        ) as mock_call:
            result = await llm_service.generate_clinical_narrative(symptoms, visits)

        self.assertEqual(result, "Concise clinical narrative.")
        mock_call.assert_awaited_once()

    async def test_extract_symptom_fields_falls_back_on_malformed_json(self) -> None:
        raw_text = "Severe pelvic cramping during my period for 8 months."
        with patch.object(llm_service, "_generate_with_gemini", AsyncMock(return_value="{")):
            result = await llm_service.extract_symptom_fields(raw_text)

        self.assertEqual(result, llm_service._fallback_symptom_extract(raw_text))

    async def test_generate_with_gemini_retries_then_succeeds(self) -> None:
        response = SimpleNamespace(text="Recovered response")
        api_error = _FakeAPIError(code=429, retry_delay=0)
        model_call = AsyncMock(side_effect=[api_error, response])
        fake_client = _FakeAsyncClient(model_call)

        with patch("google.genai.errors.APIError", _FakeAPIError), patch(
            "google.genai.types.GenerateContentConfig",
            side_effect=lambda **kwargs: kwargs,
        ), patch("google.genai.Client", return_value=SimpleNamespace(aio=fake_client)), patch(
            "services.llm_service.asyncio.sleep",
            AsyncMock(),
        ) as mock_sleep:
            result = await llm_service._generate_with_gemini(
                prompt="hello",
                system_instruction="system",
                temperature=0.1,
                max_output_tokens=100,
            )

        self.assertEqual(result, "Recovered response")
        self.assertEqual(model_call.await_count, 2)
        mock_sleep.assert_awaited_once_with(1.0)

    async def test_extract_symptom_fields_falls_back_after_retries_exhausted(self) -> None:
        raw_text = "Really bad fatigue for 3 weeks."
        with patch.object(
            llm_service,
            "_generate_with_gemini",
            AsyncMock(side_effect=_FakeAPIError(code=503)),
        ):
            result = await llm_service.extract_symptom_fields(raw_text)

        self.assertEqual(result, llm_service._fallback_symptom_extract(raw_text))


class _FakeAPIError(Exception):
    def __init__(self, code: int, retry_delay: float | None = None):
        super().__init__(f"API error {code}")
        self.code = code
        self.retry_delay = retry_delay


class _FakeAsyncClient:
    def __init__(self, model_call: AsyncMock):
        self.models = SimpleNamespace(generate_content=model_call)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


def _sample_summary_data():
    symptoms = [
        SimpleNamespace(
            logged_at=datetime(2026, 8, 10, 9, 30),
            symptom_type="Pelvic pain / Dysmenorrhea",
            clinical_text="Patient reports pelvic pain.",
            severity=8,
        )
    ]
    visits = [
        SimpleNamespace(
            visit_date=date(2026, 8, 10),
            doctor_name="Dr. Test",
            specialty="GP",
            dismissal_rate=1.0,
            visit_symptoms=[
                SimpleNamespace(symptom_id=1, outcome="dismissed", outcome_note="No workup")
            ],
        )
    ]
    return symptoms, visits
