import os
import uuid
import shutil
from fastapi import UploadFile
from fastapi.responses import FileResponse
from app import models
from app.services import claude_service
import PyPDF2
import docx

from sqlalchemy.orm import Session

def get_all(db: Session) -> list[models.CV]:
    return db.query(models.CV).all()

def get_by_id(cv_id: int, db: Session) -> models.CV:
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    if not cv:
        raise ValueError("CV not found")
    return cv

def get_cv_analyses(cv_id: int, db: Session) -> list[models.CVAnalysis]:
    cv = get_by_id(cv_id, db)
    return cv.analyses

def get_cv_file(cv_id: int, db: Session):
    cv = get_by_id(cv_id, db)
    if not os.path.exists(cv.file_path):
        raise ValueError("File not found")
    return cv.file_path

def upload_cv(cv_file: UploadFile, db: Session) -> models.CV:
    file_type = cv_file.filename.split(".")[-1]
    if file_type not in ["pdf", "docx"]:
        raise ValueError("Unsupported file type, only PDF and DOCX are allowed")

    unique_filename = f"{uuid.uuid4()}-{cv_file.filename}"
    file_path = f"uploads/cvs/{unique_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(cv_file.file, buffer)

    try:
        cv = models.CV(
            file_name=cv_file.filename,
            file_path=file_path,
            file_type=file_type
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)

        extracted_text = extract_text(file_path, file_type)
        cv_data = models.CVData(cv_id=cv.id, full_text=extracted_text)
        db.add(cv_data)
        db.commit()
        return cv

    except Exception as e:
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise ValueError(f"CV processing failed: {str(e)}")

def analyze_cv(cv_id: int, db: Session) -> models.CVAnalysis:
    cv = get_by_id(cv_id, db)

    cv_data = db.query(models.CVData).filter(models.CVData.cv_id == cv_id).first()
    if not cv_data:
        raise ValueError("CV has no parsed text data. Please re-upload the CV.")

    analysis = claude_service.analyze_cv(cv_data.full_text)

    cv_analysis = models.CVAnalysis(
        cv_id=cv_id,
        strengths=analysis.get("strengths"),
        weaknesses=analysis.get("weaknesses"),
        suggestions=analysis.get("suggestions"),
        missing_skills=analysis.get("missing_skills"),
        overall_score=analysis.get("overall_score"),
        search_keywords=analysis.get("search_keywords"),
        ai_model_version=analysis.get("ai_model_version"),
    )
    db.add(cv_analysis)
    cv.status = "analyzed"
    db.commit()
    db.refresh(cv_analysis)
    return cv_analysis

def get_cv_with_analysis(cv_id: int, db: Session):
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    if not cv:
        raise ValueError("CV not found")

    analysis = db.query(models.CVAnalysis).filter(
        models.CVAnalysis.cv_id == cv_id
    ).order_by(models.CVAnalysis.analyzed_at.desc()).first()

    if not analysis:
        raise ValueError("CV has no analysis yet. Please analyze the CV first.")

    if not analysis.search_keywords:
        raise ValueError("CV analysis has no search keywords. Please re-analyze the CV.")

    cv_data = db.query(models.CVData).filter(models.CVData.cv_id == cv_id).first()
    if not cv_data:
        raise ValueError("CV has no parsed text data.")

    return cv, analysis, cv_data

def delete_cv(cv_id: int, db: Session) -> None:
    cv = get_by_id(cv_id, db)
    if os.path.exists(cv.file_path):
        os.remove(cv.file_path)
    db.delete(cv)
    db.commit()



def extract_text(file_path: str, file_type: str) -> str:

    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file type, only PDF and DOCX are allowed")

def extract_text_from_pdf(file_path) -> str:
    text = ""

    with open(file_path,"rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()

    return text

def extract_text_from_docx(file_path) -> str:
    text = ""
    
    doc = docx.Document(file_path)
    for paragraph in doc.paragraphs:
            text += paragraph.text
    return text