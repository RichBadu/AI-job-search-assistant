from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

##### schemas is hetzelfde als dtos in c# deze worden gebruikt om data te valideren en te serialiseren/deserialiseren tussen de API en de database

class CVBase(BaseModel):
    file_name: str
    file_path: str
    file_type: str

class CVResponse(CVBase):
    id: int
    uploaded_at: datetime
    parsed_at: Optional[datetime] #deze kan nullable zijn
    status: str

    class Config:
        from_attributes = True

    
################ jobs
class PlatformStats(BaseModel):
    platform: str
    jobs_scraped: int
    jobs_new: int
    jobs_skipped: int
class JobScrapeResponse(BaseModel):
    jobs_scraped: int
    jobs_new: int
    jobs_skipped: int
    matches_created: int
    keywords_used: List[str]
    platforms: List[str]
    platform_stats: List[PlatformStats]

class JobCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    job_type: Optional[str] = None
    work_location_type: Optional[str] = "none"
    url: str
    platform: str = "manual"
    posted_date: Optional[datetime] = None
    min_years_experience: Optional[int] = None

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    url: str
    platform: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    job_type: Optional[str] = None
    work_location_type: Optional[str] = None
    min_years_experience: Optional[int] = None
    scraped_at: datetime
    posted_date: Optional[datetime] = None

    class Config:
        from_attributes = True


###################### CV Analysis
class CVAnalysisResponse(BaseModel):
    id: int
    cv_id: int
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    overall_score: Optional[int] = None
    analyzed_at: datetime
    search_keywords: Optional[List[str]] = None
    ai_model_version: Optional[str] = None

    class Config:
        from_attributes = True

########################## JobMatchResponse

class JobMatchCreate(BaseModel):
    cv_id: int
    job_id: int

class JobMatchStatusUpdate(BaseModel):
    status: str
    interview_date: Optional[datetime] = None
class JobMatchResponse(BaseModel):
    id: int
    cv_id: int
    job_id: int
    match_score: int
    reasoning: Optional[str] = None
    matching_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    matched_at: datetime
    is_interesting: bool
    status: str
    interview_date: Optional[datetime] = None

    class Config:
        from_attributes = True

########################## CoverLetter

class CoverLetterCreate(BaseModel):
    cv_id: int
    job_id: int
    language: str = "English"


class CoverLetterResponse(BaseModel):
    id: int
    cv_id: int
    job_id: int
    content: str
    generated_at: datetime
    ai_model_version: Optional[str] = None

    class Config:
        from_attributes = True
