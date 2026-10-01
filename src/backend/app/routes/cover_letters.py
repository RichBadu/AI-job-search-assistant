from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app.schemas import CoverLetterCreate, CoverLetterResponse
from app.services import cover_letter_service

router = APIRouter(
    prefix="/api/cover-letters",
    tags=["Cover Letters"]
)


@router.get("", response_model=List[CoverLetterResponse])
def get_all_cover_letters(db: Session = Depends(get_db)):
    try:
        return cover_letter_service.get_all(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{cover_letter_id}", response_model=CoverLetterResponse)
def get_cover_letter(cover_letter_id: int, db: Session = Depends(get_db)):
    try:
        return cover_letter_service.get_by_id(cover_letter_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=CoverLetterResponse, status_code=201)
def create_cover_letter(cover_letter_data: CoverLetterCreate, db: Session = Depends(get_db)):
    try:
        return cover_letter_service.create_cover_letter(
            cv_id=cover_letter_data.cv_id,
            job_id=cover_letter_data.job_id,
            language=cover_letter_data.language,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter creation failed: {str(e)}")
    
@router.delete("/{cover_letter_id}", status_code=204)
def delete_cover_letter(cover_letter_id: int, db: Session = Depends(get_db)):
    try:
        cover_letter_service.delete_cover_letter(cover_letter_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))