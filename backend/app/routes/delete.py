"""User data deletion endpoint for GDPR right-to-be-forgotten."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..auth import current_user
from ..audit import AuditLogger

router = APIRouter(prefix="/user", tags=["user"])


@router.delete("/data")
def delete_user_data(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Delete all user data and responses (GDPR compliance).
    
    This endpoint allows users to exercise their right to be forgotten.
    All personal data and assessment responses are permanently deleted.
    """
    user_id = user.id
    
    try:
        # Delete all responses for this user
        responses = db.query(models.Response).join(
            models.Membership
        ).filter(models.Membership.user_id == user_id).all()
        
        for response in responses:
            db.delete(response)
        
        # Delete all memberships (organization associations)
        memberships = db.query(models.Membership).filter_by(user_id=user_id).all()
        for membership in memberships:
            db.delete(membership)
        
        # Delete user account
        db.delete(user)
        db.commit()
        
        AuditLogger.log_data_access(
            event_type="user_data_deletion",
            user_id=str(user_id),
            resource=f"user:{user_id}",
            action="delete",
            status="success",
            details={"responses_deleted": len(responses), "memberships_deleted": len(memberships)}
        )
        
        return {"message": "User data successfully deleted", "user_id": user_id}
    
    except Exception as e:
        AuditLogger.log_data_access(
            event_type="user_data_deletion",
            user_id=str(user_id),
            resource=f"user:{user_id}",
            action="delete",
            status="failure",
            details={"error": str(e)}
        )
        raise HTTPException(500, "Failed to delete user data")
