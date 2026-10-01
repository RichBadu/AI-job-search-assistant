from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models
from app.routes import cv, jobs, matches, cover_letters

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Search Assistant API",
    description="AI-Powered Job Search Assistant Backend",
    version="0.1.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers registreren
app.include_router(cv.router)
app.include_router(jobs.router)
app.include_router(matches.router)
app.include_router(cover_letters.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

