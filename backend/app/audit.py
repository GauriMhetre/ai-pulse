"""Audit logging for security-sensitive operations."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class AuditLogger:
    """Centralized audit logging for security events."""

    @staticmethod
    def log_auth_event(
        event_type: str,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        status: str = "success",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log authentication-related events."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "org_id": org_id,
            "status": status,
            "details": details or {},
        }
        logger.info(f"AUDIT: {json.dumps(audit_data)}")

    @staticmethod
    def log_data_access(
        event_type: str,
        user_id: str,
        resource: str,
        action: str,
        status: str = "success",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log data access events (read, write, delete)."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "status": status,
            "details": details or {},
        }
        logger.info(f"AUDIT: {json.dumps(audit_data)}")

    @staticmethod
    def log_permission_denied(
        user_id: str,
        resource: str,
        action: str,
        reason: str,
    ) -> None:
        """Log permission denied events."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "permission_denied",
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "reason": reason,
        }
        logger.warning(f"AUDIT: {json.dumps(audit_data)}")
