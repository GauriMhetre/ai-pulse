from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os

from .db import Base, engine, SessionLocal
from .routes import auth_routes, diagnostic, reports, dashboard, delete
from .csrf import CSRFProtection
from .config import SECURITY_HEADERS, ALLOWED_ORIGINS
from . import models

Base.metadata.create_all(bind=engine)

# Auto-seed database on first startup (Render free tier workaround)
def auto_seed_if_empty():
    """Seed demo data if database is empty (no users exist)"""
    try:
        db = SessionLocal()
        user_count = db.query(models.User).count()
        db.close()
        
        if user_count == 0:
            # Database is empty, seed it
            from . import seed
            seed.run()
            print("✓ Database seeded with demo data on startup")
    except Exception as e:
        print(f"Auto-seed skipped or failed: {e}")

# Run auto-seed on startup (only for development/free tier)
if os.getenv("ENABLE_AUTO_SEED", "true").lower() == "true":
    auto_seed_if_empty()

app = FastAPI(title="AI Pulse API")

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        return response

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-CSRF-Token"],
)

app.include_router(auth_routes.router)
app.include_router(diagnostic.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(delete.router)


@app.get("/health")
def health():
    return {"status": "ok"}
