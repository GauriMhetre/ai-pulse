from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routes import auth_routes, diagnostic, reports, dashboard, delete
from .csrf import CSRFProtection

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Pulse API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
