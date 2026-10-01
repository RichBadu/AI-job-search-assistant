
export interface CVResponse{
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    uploaded_at: string;
    parsed_at: string | null;
    status: string;
}

export interface CVAnalysisResponse {
    id: number
    cv_id: number
    strengths: string[] | null
    weaknesses: string[] | null
    suggestions: string[] | null
    missing_skills: string[] | null
    overall_score: number | null
    analyzed_at: string
    search_keywords: string[] | null
    ai_model_version: string | null
}

export interface CoverLetterRequest {
    cv_id: number
    job_id: number
    language: string
}
export interface CoverLetterResponse {
    id: number
    cv_id: number
    job_id: number
    content: string
    generated_at: string
    ai_model_version: string | null
}

export interface JobCreate {
    title: string
    company: string
    location: string | null
    description: string | null
    requirements: string | null
    job_type: string | null
    work_location_type: string | null
    url: string
    platform: string
    posted_date: string | null
    min_years_experience: number | null
}

export interface JobResponse {
    id: number
    title: string
    company: string
    url: string
    platform: string
    location: string | null
    description: string | null
    requirements: string | null
    job_type: string | null
    work_location_type: string | null
    min_years_experience: number | null
    scraped_at: string
    posted_date: string | null
}

export interface JobScrapeResponse {
    jobs_scraped: number
    jobs_new: number
    jobs_skipped: number
    matches_created: number
    keywords_used: string[]
    platforms: string[]
    platform_stats: PlatformStatsResponse[]
}
export interface JobMatchCreate{
    cv_id: number
    job_id: number
}

export interface JobMatchStatusUpdate{
    status: string
    interview_date: string | null
}

export interface JobMatchResponse {
    id: number
    cv_id: number
    job_id: number
    match_score: number
    reasoning: string | null
    matching_skills: string[] | null
    missing_skills: string[] | null
    matched_at: string
    is_interesting: boolean
    status: string
    interview_date: string | null
}

export interface PlatformStatsResponse {
    platform: string
    jobs_scraped: number
    jobs_new: number
    jobs_skipped: number
}