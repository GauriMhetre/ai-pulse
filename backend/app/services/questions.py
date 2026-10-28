import json
import os

_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "questions.json")

# Seniority levels in order from lowest to highest
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
