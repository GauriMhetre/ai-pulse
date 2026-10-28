from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..auth import verify_password, make_token, current_user
from ..audit import AuditLogger
from ..csrf import CSRFProtection

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    email: str
    password: str


class SelectOrgIn(BaseModel):
    org_id: int


@router.get("/me")
def get_current_user(user: models.User = Depends(current_user)):
    """Get current authenticated user info for session restoration."""
    orgs = [
        {"org_id": m.org_id, "org_name": m.org.name, "role": m.role}
        for m in user.memberships
    ]
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "organizations": orgs
    }


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        AuditLogger.log_auth_event(
            "login_failed",
            user_id=user.id if user else None,
            status="failure",
            details={"email": body.email}
        )
        raise HTTPException(401, "Wrong email or password")
    AuditLogger.log_auth_event(
        "login_success",
        user_id=user.id,
        status="success"
    )
    orgs = [
        {"org_id": m.org_id, "org_name": m.org.name, "role": m.role}
        for m in user.memberships
    ]
    
    # Generate and set CSRF token
    csrf_token = CSRFProtection.generate_token()
    response = Response(
        content='{"token": "' + make_token(user.id) + '", "name": "' + user.name + '", "organizations": ' + str(orgs).replace("'", '"') + '}',
        media_type="application/json"
    )
    response.set_cookie(
        key=CSRFProtection.COOKIE_NAME,
        value=csrf_token,
        httponly=True,
        secure=True,
        samesite="Strict"
    )
    return response


@router.post("/select-org")
def select_org(body: SelectOrgIn, user: models.User = Depends(current_user)):
    # Issue a token scoped to the chosen organization
    return {"token": make_token(user.id, body.org_id), "org_id": body.org_id}
