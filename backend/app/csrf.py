"""CSRF protection middleware and utilities."""

import secrets
from fastapi import Request, HTTPException


class CSRFProtection:
    """CSRF token generation and validation."""

    HEADER_NAME = "X-CSRF-Token"
    COOKIE_NAME = "csrf_token"

    @staticmethod
    def generate_token() -> str:
        """Generate a cryptographically secure CSRF token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    async def validate_token(request: Request) -> bool:
        """Validate CSRF token from request headers and cookies.
        
        For state-changing operations (POST, PUT, DELETE):
        - Extract token from X-CSRF-Token header
        - Compare with csrf_token cookie
        - Both must match and be non-empty
        """
        # Skip validation for GET requests
        if request.method == "GET":
            return True

        # Get token from header
        header_token = request.headers.get(CSRFProtection.HEADER_NAME)
        if not header_token:
            raise HTTPException(403, "Missing CSRF token header")

        # Get token from cookies
        cookie_token = request.cookies.get(CSRFProtection.COOKIE_NAME)
        if not cookie_token:
            raise HTTPException(403, "Missing CSRF token cookie")

        # Compare tokens
        if header_token != cookie_token:
            raise HTTPException(403, "CSRF token mismatch")

        return True
