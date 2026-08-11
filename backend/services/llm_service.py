import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import asyncio
from typing import Any
from typing import TYPE_CHECKING

from config import get_settings

SYMPTOM_SYSTEM_PROMPT = """You are a clinical documentation assistant. Return only JSON with:
clinical_text, body_location, symptom_type, duration, severity, onset_pattern,
aggravating_factors, relieving_factors."""

SUMMARY_SYSTEM_PROMPT = """Write a concise, factual clinical summary in third-person objective language."""
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}
MAX_PROVIDER_RETRIES = 2
BASE_RETRY_DELAY_SECONDS = 1.0
MAX_RETRY_DELAY_SECONDS = 8.0

SYMPTOM_RESPONSE_JSON_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "clinical_text": {"type": "string"},
        "body_location": {"type": "string"},
        "symptom_type": {"type": "string"},
        "duration": {"type": "string"},
        "severity": {"type": "integer", "minimum": 0, "maximum": 10},
        "onset_pattern": {"type": "string"},
        "aggravating_factors": {"type": "array", "items": {"type": "string"}},
        "relieving_factors": {"type": "array", "items": {"type": "string"}},
    },
}

SYMPTOM_RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "OBJECT",
    "properties": {
        "clinical_text": {"type": "STRING"},
        "body_location": {"type": "STRING"},
        "symptom_type": {"type": "STRING"},
        "duration": {"type": "STRING"},
        "severity": {"type": "INTEGER", "minimum": 0, "maximum": 10},
        "onset_pattern": {"type": "STRING"},
        "aggravating_factors": {"type": "ARRAY", "items": {"type": "STRING"}},
        "relieving_factors": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
}


def _fallback_symptom_extract(raw_text: str) -> dict[str, Any]:
    text = raw_text.lower()
    is_fatigue = any(word in text for word in ["fatigue", "tired", "exhaust", "sleep"])
    is_bloating = any(word in text for word in ["bloat", "stomach", "abdomen"])
    is_joint = any(word in text for word in ["joint", "shoulder", "hip"])
    is_pelvic = bool(re.search(r"\b(pelvis|pelvic|cramp|menstrual|period pain)\b", text))
    severity = 8 if any(word in text for word in ["severe", "bad", "really bad"]) else 6

    if is_fatigue:
        symptom_type = "Fatigue / Cognitive impairment"
        location = "Generalized"
    elif is_bloating:
        symptom_type = "Abdominal bloating"
        location = "Abdomen"
    elif is_joint:
        symptom_type = "Joint pain / Arthralgia"
        location = "Joints"
    elif is_pelvic:
        symptom_type = "Pelvic pain / Dysmenorrhea"
        location = "Lower abdomen / pelvis"
    else:
        symptom_type = "Pain / Unspecified symptom"
        location = "Patient reported area"

    return {
        "clinical_text": (
            f"Patient reports {symptom_type.lower()} based on patient-provided history. "
            f"Symptoms should be reviewed clinically with duration, triggers, and associated features confirmed. "
            f"Estimated severity is {severity}/10 from the submitted description."
        ),
        "body_location": location,
        "symptom_type": symptom_type,
        "duration": _extract_duration(raw_text),
        "severity": severity,
        "onset_pattern": "Cyclical" if any(word in text for word in ["period", "monthly", "cycle"]) else None,
        "aggravating_factors": _extract_factors(raw_text, ["worse", "especially", "after", "when"]),
        "relieving_factors": _extract_factors(raw_text, ["better", "helps", "relief"]),
    }


def _extract_duration(raw_text: str) -> str | None:
    match = re.search(r"(\d+\s*(?:day|days|week|weeks|month|months|year|years))", raw_text, re.IGNORECASE)
    return match.group(1) if match else None


def _extract_factors(raw_text: str, markers: list[str]) -> list[str]:
    lower = raw_text.lower()
    found = [marker.capitalize() for marker in markers if marker in lower]
    return found[:3]


def _coerce_symptom_payload(payload: dict[str, Any], raw_text: str) -> dict[str, Any]:
    fallback = _fallback_symptom_extract(raw_text)
    severity = payload.get("severity")
    if isinstance(severity, str) and severity.isdigit():
        severity = int(severity)
    if not isinstance(severity, int):
        severity = fallback["severity"]

    return {
        "clinical_text": payload.get("clinical_text") or fallback["clinical_text"],
        "body_location": payload.get("body_location"),
        "symptom_type": payload.get("symptom_type"),
        "duration": payload.get("duration"),
        "severity": severity,
        "onset_pattern": payload.get("onset_pattern"),
        "aggravating_factors": _coerce_string_list(payload.get("aggravating_factors")),
        "relieving_factors": _coerce_string_list(payload.get("relieving_factors")),
    }


def _coerce_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str) and item.strip()]


def _is_retryable_error(exc: Exception) -> bool:
    status_code = getattr(exc, "code", None)
    return isinstance(status_code, int) and status_code in RETRYABLE_STATUS_CODES


def _get_retry_delay_seconds(exc: Exception) -> float | None:
    for attr_name in ("retry_delay", "retry_delay_seconds"):
        retry_delay = getattr(exc, attr_name, None)
        if isinstance(retry_delay, (int, float)) and retry_delay > 0:
            return float(retry_delay)

    response = getattr(exc, "response", None)
    headers = getattr(response, "headers", None)
    if headers:
        retry_after = headers.get("retry-after")
        if retry_after:
            try:
                return max(float(retry_after), 0.0)
            except ValueError:
                try:
                    retry_at = parsedate_to_datetime(retry_after)
                    now = datetime.now(retry_at.tzinfo or timezone.utc)
                    return max((retry_at - now).total_seconds(), 0.0)
                except (TypeError, ValueError, IndexError, OverflowError):
                    return None

    return None


def _get_text_from_response(response: Any) -> str | None:
    text = getattr(response, "text", None)
    if isinstance(text, str):
        stripped = text.strip()
        if stripped:
            return stripped
    return None


def _set_response_schema(
    config_kwargs: dict[str, Any],
    response_schema: dict[str, Any],
    response_json_schema: dict[str, Any],
    types_module: Any,
) -> None:
    config_kwargs["response_mime_type"] = "application/json"
    model_fields = getattr(types_module.GenerateContentConfig, "model_fields", {})
    if "response_json_schema" in model_fields:
        config_kwargs["response_json_schema"] = response_json_schema
    else:
        config_kwargs["response_schema"] = response_schema


async def _generate_with_gemini(
    *,
    prompt: str,
    system_instruction: str,
    temperature: float,
    max_output_tokens: int,
    response_json_schema: dict[str, Any] | None = None,
) -> str | None:
    settings = get_settings()
    if not settings.gemini_api_key:
        return None

    from google import genai
    from google.genai import errors, types

    config_kwargs: dict[str, Any] = {
        "system_instruction": system_instruction,
        "temperature": temperature,
        "max_output_tokens": max_output_tokens,
    }
    if response_json_schema is not None:
        _set_response_schema(
            config_kwargs,
            response_schema=SYMPTOM_RESPONSE_SCHEMA,
            response_json_schema=response_json_schema,
            types_module=types,
        )

    async with genai.Client(api_key=settings.gemini_api_key).aio as client:
        for attempt in range(MAX_PROVIDER_RETRIES + 1):
            try:
                response = await client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )
                return _get_text_from_response(response)
            except asyncio.TimeoutError:
                if attempt >= MAX_PROVIDER_RETRIES:
                    raise
            except errors.APIError as exc:
                if attempt >= MAX_PROVIDER_RETRIES or not _is_retryable_error(exc):
                    raise
                delay_seconds = _get_retry_delay_seconds(exc)
                if delay_seconds is None:
                    delay_seconds = min(BASE_RETRY_DELAY_SECONDS * (2**attempt), MAX_RETRY_DELAY_SECONDS)
                await asyncio.sleep(delay_seconds)
                continue

            delay_seconds = min(BASE_RETRY_DELAY_SECONDS * (2**attempt), MAX_RETRY_DELAY_SECONDS)
            await asyncio.sleep(delay_seconds)

    return None


async def extract_symptom_fields(raw_text: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.gemini_api_key:
        return _fallback_symptom_extract(raw_text)

    try:
        content = await _generate_with_gemini(
            prompt=raw_text,
            system_instruction=SYMPTOM_SYSTEM_PROMPT,
            temperature=0.1,
            max_output_tokens=800,
            response_json_schema=SYMPTOM_RESPONSE_JSON_SCHEMA,
        )
        if not content:
            return _fallback_symptom_extract(raw_text)
        return _coerce_symptom_payload(json.loads(content), raw_text)
    except Exception:
        return _fallback_symptom_extract(raw_text)


def _fallback_clinical_narrative(symptoms: list[Any], visits: list[Any]) -> str | None:
    if not symptoms:
        return None

    primary = ", ".join(sorted({s.symptom_type for s in symptoms if s.symptom_type})[:4])
    total_presented = sum(len(v.visit_symptoms) for v in visits)
    total_dismissed = sum(1 for v in visits for item in v.visit_symptoms if item.outcome == "dismissed")
    return (
        f"Patient has documented {len(symptoms)} symptom(s), including {primary or 'unspecified symptoms'}. "
        f"Across {len(visits)} visit(s), {total_dismissed} of {total_presented} presented symptom outcome(s) "
        "were recorded as dismissed or not addressed. Ongoing symptoms and prior dismissal patterns should be "
        "reviewed during the next consultation."
    )


async def generate_clinical_narrative(symptoms: list[Any], visits: list[Any]) -> str | None:
    settings = get_settings()
    if not symptoms:
        return None
    if not settings.gemini_api_key:
        return _fallback_clinical_narrative(symptoms, visits)

    payload = {
        "symptoms": [
            {
                "logged_at": symptom.logged_at.isoformat(),
                "symptom_type": symptom.symptom_type,
                "clinical_text": symptom.clinical_text,
                "severity": symptom.severity,
            }
            for symptom in symptoms
        ],
        "visits": [
            {
                "visit_date": visit.visit_date.isoformat(),
                "doctor_name": visit.doctor_name,
                "specialty": visit.specialty,
                "dismissal_rate": visit.dismissal_rate,
                "outcomes": [
                    {
                        "symptom_id": item.symptom_id,
                        "outcome": item.outcome,
                        "outcome_note": item.outcome_note,
                    }
                    for item in visit.visit_symptoms
                ],
            }
            for visit in visits
        ],
    }

    try:
        return await _generate_with_gemini(
            prompt=json.dumps(payload),
            system_instruction=SUMMARY_SYSTEM_PROMPT,
            temperature=0.2,
            max_output_tokens=1000,
        )
    except Exception:
        return None
