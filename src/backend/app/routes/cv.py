import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app.schemas import CVResponse, CVAnalysisResponse
from app.services import cv_service, claude_service

## voorbeeld van c# controller
""""""""""""""
#[ApiController]
#[Route("api/cvs")]
#public class CVController : ControllerBase {}
""""""""""""""
router = APIRouter(
    prefix="/api/cvs",
    tags=["CVs"]
)


@router.get("", response_model=List[CVResponse])
def get_all_cvs(db: Session = Depends(get_db)):
    try:
        return cv_service.get_all(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(cv_id: int, db: Session = Depends(get_db)):
    try:
        return cv_service.get_by_id(cv_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{cv_id}/analysis", response_model=List[CVAnalysisResponse])
def get_cv_analysis(cv_id: int, db: Session = Depends(get_db)):
    try:
        return cv_service.get_cv_analyses(cv_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{cv_id}/file")
def get_cv_file(cv_id: int, db: Session = Depends(get_db)):
    try:
        file_path = cv_service.get_cv_file(cv_id, db)
        return FileResponse(file_path)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))   


@router.post("", response_model=CVResponse, status_code=201)
def create_cv(cv_file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        return cv_service.upload_cv(cv_file, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{cv_id}/analyze", response_model=CVAnalysisResponse, status_code=201)
def analyze_cv(cv_id: int, db: Session = Depends(get_db)):
    try:
        return cv_service.analyze_cv(cv_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{cv_id}", status_code=204)
def delete_cv(cv_id: int, db: Session = Depends(get_db)):
    try:
        cv_service.delete_cv(cv_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))