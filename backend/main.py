import sys
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.database import engine, Base, SessionLocal
    from backend.seed import seed_database
    from backend.routers import auth_routes, student_routes, job_routes, recruiter_routes, admin_routes
except ImportError:
    from database import engine, Base, SessionLocal
    from seed import seed_database
    from routers import auth_routes, student_routes, job_routes, recruiter_routes, admin_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed on startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CampusMatch AI — Career Intelligence API",
    description="Backend API for CampusMatch AI with Argon2id auth, SQLite persistence, and deterministic matching.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register versioned routers
app.include_router(auth_routes.router)
app.include_router(student_routes.router)
app.include_router(job_routes.router)
app.include_router(recruiter_routes.router)
app.include_router(admin_routes.router)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "app": "CampusMatch AI", "environment": "production"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
