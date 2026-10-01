from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app.schemas import JobMatchResponse, JobMatchCreate, JobMatchStatusUpdate
from app.services import match_service

router = APIRouter(
    prefix="/api/matches",
    tags=["Matches"]
)


@router.get("", response_model=List[JobMatchResponse])
def get_all(db: Session = Depends(get_db)):
    try:
        return match_service.get_all(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{match_id}", response_model=JobMatchResponse)
def get_by_id(match_id: int, db: Session = Depends(get_db)):
    try:
        return match_service.get_by_id(match_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/cv/{cv_id}", response_model=List[JobMatchResponse])
def get_matches_for_cv(cv_id: int, db: Session = Depends(get_db)):
    try:
        return match_service.get_matches_for_cv(cv_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=JobMatchResponse, status_code=201)
def create_match(match_data: JobMatchCreate, db: Session = Depends(get_db)):
    try:
        return match_service.create_match_for_existing_job(match_data.cv_id, match_data.job_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: int, db: Session = Depends(get_db)):
    try:
        match_service.delete_match(match_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/{match_id}/status", response_model=JobMatchResponse)
def update_match_status(match_id: int, status_data: JobMatchStatusUpdate, db: Session = Depends(get_db)):
    try:
        return match_service.update_status(match_id, status_data.status, status_data.interview_date, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
