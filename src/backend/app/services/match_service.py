# app/services/match_service.py
from sqlalchemy.orm import Session
from app import models
from app.services import claude_service, scraper_service
from sqlalchemy import or_, and_


def get_all(db: Session) -> list[models.JobMatch]:
    return db.query(models.JobMatch).all()


def get_by_id(match_id: int, db: Session) -> models.JobMatch:
    match = db.query(models.JobMatch).filter(models.JobMatch.id == match_id).first()
    if not match:
        raise ValueError("Match not found")
    return match


def get_matches_for_cv(cv_id: int, db: Session) -> list[models.JobMatch]:
    return db.query(models.JobMatch).filter(
        models.JobMatch.cv_id == cv_id
    ).order_by(models.JobMatch.match_score.desc()).all()


def create_match_for_existing_job(cv_id: int, job_id: int, db: Session) -> models.JobMatch:
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    if not cv:
        raise ValueError("CV not found")

    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise ValueError("Job not found")

    cv_data = db.query(models.CVData).filter(models.CVData.cv_id == cv_id).first()
    if not cv_data:
        raise ValueError("CV has no parsed text data")

    result = claude_service.process_job(
        cv_text=cv_data.full_text,
        job_title=job.title,
        company=job.company,
        job_description=job.description or "",
        job_requirements=job.requirements or ""
    )

    match = models.JobMatch(
        cv_id=cv_id,
        job_id=job_id,
        match_score=result["match_score"],
        reasoning=result.get("reasoning"),
        matching_skills=result.get("matching_skills"),
        missing_skills=result.get("missing_skills"),
        is_interesting=result.get("is_interesting", False)
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def delete_match(match_id: int, db: Session) -> None:
    match = db.query(models.JobMatch).filter(models.JobMatch.id == match_id).first()
    if not match:
        raise ValueError("Match not found")
    db.delete(match)
    db.commit()



def is_duplicate(job_data: dict, db: Session) -> models.Job | None:
    return db.query(models.Job).filter(
        or_(
            models.Job.url == job_data["url"],
            and_(
                models.Job.title == job_data["title"],
                models.Job.company == job_data["company"],
                models.Job.location == job_data.get("location")
            )
        )
    ).first()


def create_job_and_match(job_data: dict,cv_id: int,cv_text: str, db: Session) -> bool|None:
    try:
        result = claude_service.process_job(
        cv_text=cv_text,
        job_title=job_data["title"],
        company=job_data["company"],
        job_description=job_data.get("description", ""),
        job_requirements=job_data.get("requirements", "")
        )

        job = models.Job(
            title= job_data["title"],
            company= job_data["company"],
            location= job_data.get("location"),
            description= job_data.get("description"),
            url= job_data["url"],
            platform= job_data["platform"],
            job_type= result.get("job_type"),
            work_location_type= result.get("work_location_type", "none"),
            requirements= result.get("requirements"),
            min_years_experience= result.get("min_years_experience"),
            posted_date= job_data.get("posted_date")
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        match = models.JobMatch(
        cv_id=cv_id,
        job_id=job.id,
        match_score= result["match_score"],
        reasoning= result.get("reasoning"),
        matching_skills= result.get("matching_skills"),
        missing_skills= result.get("missing_skills"),
        is_interesting =result.get("is_interesting", False)
        )
        db.add(match)
        db.commit()
        return True
    
    except Exception as e:
        print(f"save_job_and_match fout: {e}")
        db.rollback()
        return None

def find_and_match_jobs_for_cv(cv_id: int, keywords: list, cv_text: str, platforms: list, locations: dict, db: Session) -> dict:
    stats = {
        "jobs_scraped": 0,
        "jobs_new": 0,
        "jobs_skipped": 0,
        "matches_created": 0,
        "platform_stats": {p: {"jobs_scraped": 0, "jobs_new": 0, "jobs_skipped": 0} for p in platforms}
    }

    for keyword in keywords:
        for platform in platforms:
            platform_locations = locations.get(platform, [])
            p_stats = stats["platform_stats"][platform]   
            for location in platform_locations:  
                try:  
                    scraped_jobs = scraper_service.scrape_jobs(
                        keyword=keyword,
                        platform=platform,
                        location=location,
                        max_pages=1
                    )       
                except Exception:
                    continue        

                p_stats = stats["platform_stats"][platform]
                stats["jobs_scraped"] += len(scraped_jobs)
                p_stats["jobs_scraped"] += len(scraped_jobs)

                for job_data in scraped_jobs:
                    full_details = scraper_service.scrape_job_details(job_data["url"])
                    if full_details.get("description"):
                        job_data["description"] = full_details["description"]
                    if full_details.get("posted_date"):
                        job_data["posted_date"] = full_details["posted_date"]

                    existing = is_duplicate(job_data, db)
                    if existing:
                        stats["jobs_skipped"] += 1
                        p_stats["jobs_skipped"] += 1
                        existing_match = db.query(models.JobMatch).filter(
                            models.JobMatch.cv_id == cv_id,
                            models.JobMatch.job_id == existing.id
                        ).first()
                        if not existing_match:
                            try:
                                create_match_for_existing_job(cv_id, existing.id, db) 
                                stats["matches_created"] += 1
                            except Exception:
                                db.rollback()
                        continue

                    if create_job_and_match(job_data, cv_id, cv_text, db):
                        stats["jobs_new"] += 1
                        p_stats["jobs_new"] += 1
                        stats["matches_created"] += 1

    return stats

def update_status(match_id: int, status: str, interview_date, db: Session) -> models.JobMatch:
    match = get_by_id(match_id, db)
    match.status = status
    match.interview_date = interview_date
    db.commit()
    db.refresh(match)
    return match