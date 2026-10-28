"""Scoring pipeline with validation and error handling.

Implements production-ready score validation:
- Safe JSON parsing with fallback defaults
- Score clamping to [1, 5] range
- Flag validation (filter to allowed set only)
- Reason text truncation (max 500 chars)
- Error logging for debugging
"""
import json
import logging

from . import llm

logger = logging.getLogger(__name__)

# Allowed risk flags from LLM scoring
ALLOWED_FLAGS = {
    "customer_data_shared",
    "confidential_data_shared", 
    "unreviewed_output",
    "policy_unaware"
}


def score_open_answer(question_text: str, answer: str) -> dict:
    """Score an open-ended answer with comprehensive error handling.
    
    Returns a dict with score (1-5), reason (str), flags (list).
    Falls back to safe defaults on any error.
    """
    try:
        raw = llm.score_answer(question_text, answer)
        data = json.loads(raw)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"LLM scoring error: {e}. Using safe defaults.")
        return {"score": 3, "reason": "Assessment processing error", "flags": []}
    
    # Validate and clamp score to [1, 5]
    score = data.get("score", 3)
    if not isinstance(score, (int, float)) or score < 1 or score > 5:
        score = max(1, min(5, int(score) if isinstance(score, float) else 3))
    
    # Truncate reason to max 500 chars
    reason = str(data.get("reason", ""))[:500]
    
    # Filter flags to allowed set only
    raw_flags = data.get("flags", [])
    flags = [f for f in raw_flags if f in ALLOWED_FLAGS] if isinstance(raw_flags, list) else []
    
    return {"score": score, "reason": reason, "flags": flags}
