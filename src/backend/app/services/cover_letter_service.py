from sqlalchemy.orm import Session
from app import models
from app.services import claude_service



def get_all(db: Session) -> list[models.CoverLetter]:
    return db.query(models.CoverLetter).all()

def get_by_id(cover_letter_id: int, db: Session) -> models.CoverLetter:
    cover_letter = db.query(models.CoverLetter).filter(
        models.CoverLetter.id == cover_letter_id
    ).first()
    if not cover_letter:
        raise ValueError("Cover letter not found")
    return cover_letter

def delete_cover_letter(cover_letter_id: int, db: Session) -> None:
    cover_letter = db.query(models.CoverLetter).filter(
        models.CoverLetter.id == cover_letter_id
    ).first()
    if not cover_letter:
        raise ValueError("Cover letter not found")
    db.delete(cover_letter)
    db.commit()

def create_cover_letter(cv_id: int, job_id: int, language: str, db: Session) -> models.CoverLetter:
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    if not cv:
        raise ValueError("CV not found")

    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise ValueError("Job not found")

    cv_data = db.query(models.CVData).filter(models.CVData.cv_id == cv_id).first()
    if not cv_data:
        raise ValueError("CV has no parsed text data")

    result = claude_service.generate_cover_letter(
        cv_text=cv_data.full_text,
        job_title=job.title,
        company=job.company,
        job_description=job.description or "",
        language=language
    )

    cover_letter = models.CoverLetter(
        cv_id=cv_id,
        job_id=job_id,
        content=result["content"],
        ai_model_version=result.get("ai_model_version")
    )
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)
    return cover_letter