# app/services/job_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app import models
from datetime import datetime, timedelta

def get_all(db: Session) -> list[models.Job]:
    return db.query(models.Job).all()

def get_by_id(job_id: int, db: Session) -> models.Job:
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise ValueError("Job not found")
    return job

def create_job(job_data: dict, db: Session) -> models.Job:
    existing = db.query(models.Job).filter(
        models.Job.url == job_data["url"]
    ).first()
    if existing:
        raise ValueError("Job with this URL already exists")

    job = models.Job(
        title=job_data["title"],
        company=job_data["company"],
        location=job_data.get("location"),
        description=job_data.get("description"),
        requirements=job_data.get("requirements"),
        job_type=job_data.get("job_type"),
        work_location_type=job_data.get("work_location_type", "none"),
        url=job_data["url"],
        platform=job_data.get("platform", "manual"),
        posted_date=job_data.get("posted_date"),
        min_years_experience=job_data.get("min_years_experience"),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def delete_job(job_id: int, db: Session) -> None:
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise ValueError("Job not found")
    db.query(models.JobMatch).filter(models.JobMatch.job_id == job_id).delete(synchronize_session=False)
    db.query(models.CoverLetter).filter(models.CoverLetter.job_id == job_id).delete(synchronize_session=False)
    db.delete(job)
    db.commit()


def cleanup_old_jobs(days: int, db: Session) -> dict:
    cutoff_date = datetime.now().astimezone() - timedelta(days=days)

    old_jobs = db.query(models.Job).filter(
        models.Job.scraped_at < cutoff_date
    ).all()

    old_job_ids = [job.id for job in old_jobs]

    matches_deleted = db.query(models.JobMatch).filter(
        models.JobMatch.job_id.in_(old_job_ids)
    ).delete(synchronize_session=False)

    jobs_deleted = db.query(models.Job).filter(
        models.Job.scraped_at < cutoff_date
    ).delete(synchronize_session=False)

    db.commit()

    return {
        "jobs_deleted": jobs_deleted,
        "matches_deleted": matches_deleted,
        "cutoff_date": cutoff_date.isoformat()
    }