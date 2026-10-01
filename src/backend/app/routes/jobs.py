from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models
from app.schemas import JobCreate, JobResponse,JobScrapeResponse, PlatformStats
from app.services import job_service, match_service, cv_service

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"]
)


@router.get("", response_model=List[JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    try:
        return job_service.get_all(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    try:
        return job_service.get_by_id(job_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=JobResponse, status_code=201)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    try:
        return job_service.create_job(job_data.model_dump(), db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.post("/scrape/{cv_id}", response_model=JobScrapeResponse, status_code=201)
def scrape_jobs_for_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    location_be: Optional[str] = None,
    location_au: Optional[str] = None
):
    locations = {}
    platforms = []

    if location_be:
        locations["talent_be"] = location_be.split(",")
        platforms.append("talent_be")

    if location_au:
        locations["talent_au"] = location_au.split(",")
        platforms.append("talent_au")

    if not platforms:
        raise HTTPException(status_code=400, detail="must provide at least one location")
    try:
        cv, analysis, cv_data = cv_service.get_cv_with_analysis(cv_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    stats = match_service.find_and_match_jobs_for_cv(
        cv_id=cv_id,
        keywords=analysis.search_keywords,
        cv_text=cv_data.full_text,
        platforms=platforms,
        locations=locations,
        db=db
    )

    return JobScrapeResponse(
        jobs_scraped=stats["jobs_scraped"],
        jobs_new=stats["jobs_new"],
        jobs_skipped=stats["jobs_skipped"],
        matches_created=stats["matches_created"],
        keywords_used=analysis.search_keywords,
        platforms=platforms,
        platform_stats=[
            PlatformStats(platform=p, **s)
            for p, s in stats["platform_stats"].items()
        ]
    )



@router.delete("/cleanup", status_code=200)
def cleanup_old_jobs(days: int = 7, db: Session = Depends(get_db)):
    try:
        return job_service.cleanup_old_jobs(days, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    try:
        job_service.delete_job(job_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))