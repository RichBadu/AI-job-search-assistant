from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# ============================================================================
# MODEL 1: CV - informatie over geüploade CV's
# ============================================================================
class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False) #pdf, docx, txt
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    parsed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="uploaded", index=True) # uploaded,analyzed, error

    #relationships
    cv_data = relationship("CVData", back_populates="cv", uselist=False,cascade="all, delete-orphan") # one-to-one relatie
    analyses = relationship("CVAnalysis", back_populates="cv",cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="cv",cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="cv",cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CV(id={self.id}, file_name='{self.file_name}', status='{self.status}')>"

# ============================================================================
# MODEL 2: CVData - informatie over geparseerde CV's
# ============================================================================
class CVData(Base):
    __tablename__ = "cv_data"
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"),nullable=False, unique=True)
    full_text = Column(Text, nullable=False)
    skills = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    languages = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cv = relationship("CV", back_populates="cv_data")

    def __repr__(self):
        return f"<CVData(id={self.id}, cv_id={self.cv_id})>"

# ============================================================================
# MODEL 3: CVAnalysis - informatie over geanalyseerde CV's
# ============================================================================
class CVAnalysis(Base):
    __tablename__ = "cv_analyses"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    overall_score = Column(Integer, nullable=True)
    search_keywords = Column(JSON, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(),index=True)

    ai_model_version = Column(String(100), nullable=True)

    # Relationships
    cv = relationship("CV", back_populates="analyses")

    def __repr__(self):
        return f"<CVAnalysis(id={self.id}, cv_id={self.cv_id}, score={self.overall_score})>"
    
# ============================================================================
# MODEL 4: Job - informatie over vacatures
# ============================================================================
class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    job_type = Column(String(50), nullable=True)  # full-time, part-time, contract
    work_location_type = Column(String(50), nullable=True, default="none") # remote, on-site, hybrid, none
    url = Column(String(500), nullable=False, unique=True)
    platform = Column(String(50), nullable=False, index=True)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    posted_date = Column(DateTime(timezone=True), nullable=True)
    min_years_experience = Column(Integer, nullable=True)
    
    # Relationships
    matches = relationship("JobMatch", back_populates="job")
    cover_letters = relationship("CoverLetter", back_populates="job")
    
    def __repr__(self):
        return f"<Job(id={self.id}, title='{self.title}', company='{self.company}')>"
    

# ============================================================================
# MODEL 5: JobMatch - informatie over de match tussen CV's en vacatures (joined table)
# ============================================================================
class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    match_score = Column(Integer, nullable=False, index=True)  # 0-100
    reasoning = Column(Text, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    matched_at = Column(DateTime(timezone=True), server_default=func.now())
    is_interesting = Column(Boolean, default=False) 
    status = status = Column(String(50), default="interested")
    interview_date = Column(DateTime, nullable=True)

    cv = relationship("CV", back_populates="matches")
    job = relationship("Job", back_populates="matches")

    def __repr__(self):
        return f"<JobMatch(id={self.id}, cv_id={self.cv_id}, job_id={self.job_id}, score={self.match_score})>"
    

# ============================================================================
# MODEL 6: CoverLetter - informatie over gegenereerde sollicitatiebrieven (joined table)
# ============================================================================    
class CoverLetter(Base):
    __tablename__ = "cover_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    content = Column(Text, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    ai_model_version = Column(String(100), nullable=True)
    
    # Relationships
    cv = relationship("CV", back_populates="cover_letters")
    job = relationship("Job", back_populates="cover_letters")
    
    def __repr__(self):
        return f"<CoverLetter(id={self.id}, cv_id={self.cv_id}, job_id={self.job_id})>"   