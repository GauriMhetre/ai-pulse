"""Question selection and seniority-based filtering.

Implements role-based and seniority-level question adaptation.
Questions are filtered by:
1. Job role (e.g., 'engineering', 'support')
2. Seniority level using numeric comparison (prevents string ordering bugs)
"""
import json
import os

_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "questions.json")

# Seniority levels in order from lowest to highest
# Fixed: Previously used string comparison which failed for 'lead' < 'senior' (true alphabetically, false logically)
SENIORITY_HIERARCHY = ["junior", "mid", "senior", "lead"]


def load_questions():
    with open(_PATH) as f:
        return json.load(f)


def _seniority_level(seniority: str) -> int:
    """Convert seniority string to numeric level for comparison."""
    return SENIORITY_HIERARCHY.index(seniority) if seniority in SENIORITY_HIERARCHY else 0


def questions_for(job_role: str, seniority: str):
    """Common questions for everyone + questions for this job role, filtered by seniority."""
    result = []
    user_level = _seniority_level(seniority)
    for q in load_questions():
        if q["roles"] != ["all"] and job_role not in q["roles"]:
            continue
        min_level = _seniority_level(q.get("min_seniority", "junior"))
        if user_level < min_level:
            continue
        result.append(q)
    return result
