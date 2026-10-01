import os
import json
import anthropic

client = anthropic.Anthropic(
    api_key=os.getenv("CLAUDE_API_KEY")
)

AI_MODEL_STANDARD = "claude-sonnet-4-5"
AI_MODEL_FAST = "claude-haiku-4-5"


def clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.index("\n")
        text = text[first_newline + 1:]
        text = text.rstrip("`").strip()
    return text


def analyze_cv(cv_text: str) -> dict:

    prompt = f"""Analyze the following CV/resume and provide a structured evaluation.

CV Text:
{cv_text}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{{
    "strengths": ["strength 1", "strength 2", "..."],
    "weaknesses": ["weakness 1", "weakness 2", "..."],
    "suggestions": ["suggestion 1", "suggestion 2", "..."],
    "missing_skills": ["skill 1", "skill 2", "..."],
    "search_keywords": ["python developer", "fastapi developer", "..."],
    "overall_score": 75
}}

Rules:
- strengths: list of strong points in the CV (3-6 items)
- weaknesses: list of areas that need improvement (3-6 items)
- suggestions: actionable tips to improve the CV (3-6 items)
- missing_skills: commonly expected skills that are absent (3-6 items)
- search_keywords: 2 relevant job search keywords based on the CV (e.g. "python developer", "Csharp developer", "dotnet developer")
- overall_score: integer from 0 to 100
- Be specific and constructive, reference actual content from the CV
- Never use special characters like # in keywords, use "csharp" instead of "C#" and "dotnet" instead of ".NET"""

    try:
        response = client.messages.create(
            model=AI_MODEL_STANDARD,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        result_text = response.content[0].text
        result_text = clean_json_response(result_text)
        analysis = json.loads(result_text)
        analysis["ai_model_version"] = AI_MODEL_STANDARD
        return analysis

    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Claude API call failed: {str(e)}")


def generate_cover_letter(cv_text: str, job_title: str, company: str, job_description: str, language: str = "English") -> dict:

    prompt = f"""Write a professional cover letter for the following job application.
Write the entire cover letter in {language}.

CV/Resume:
{cv_text}

Job Title: {job_title}
Company: {company}
Job Description:
{job_description}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{{
    "content": "The full cover letter text here"
}}

Rules:
- Write a compelling, personalized cover letter (300-500 words)
- Reference specific skills and experience from the CV that match the job
- Show enthusiasm for the company and role
- Keep a professional but genuine tone
- Do NOT include placeholder brackets like [Your Name] - use info from the CV
- Structure: opening paragraph, 1-2 body paragraphs, closing paragraph"""

    try:
        response = client.messages.create(
            model=AI_MODEL_STANDARD,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )
        result_text = response.content[0].text
        result_text = clean_json_response(result_text)
        result = json.loads(result_text)
        result["ai_model_version"] = AI_MODEL_STANDARD
        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Claude API call failed: {str(e)}")


def process_job(cv_text: str, job_title: str, company: str, job_description: str, job_requirements: str) -> dict:

    prompt = f"""Analyze how well this CV matches the following job posting.

CV/Resume:
{cv_text}

Job Title: {job_title}
Company: {company}
Job Description:
{job_description}
Job Requirements:
{job_requirements}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{{
    "job_type": "full-time",
    "work_location_type": "on-site",
    "requirements": "extracted requirements if any",
    "min_years_experience": 2,
    "match_score": 75,
    "reasoning": "Brief explanation of the match",
    "matching_skills": ["skill 1", "skill 2"],
    "missing_skills": ["skill 1", "skill 2"],
    "is_interesting": true
}}

Rules:
- job_type: "full-time", "part-time", "contract", "freelance" or null if unknown
- work_location_type: "remote", "on-site", "hybrid" or "none" if unknown
- requirements: short summary of required skills/experience or null if not found
- min_years_experience: integer, minimum years of experience required, null if not mentioned. Look for phrases like "X jaar ervaring", "X years experience", "minimum X jaar", "at least X years
- match_score: integer from 0 to 100 based on how well the CV fits the job
- reasoning: 2-3 sentences explaining the score
- matching_skills: skills from the CV that match the job requirements (3 items)
- missing_skills: required skills not found in the CV (3-6 items)
- is_interesting: true if match_score >= 60, false otherwise"""

    try:
        response = client.messages.create(
            model=AI_MODEL_FAST,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        result_text = response.content[0].text
        result_text = clean_json_response(result_text)
        result = json.loads(result_text)
        result["ai_model_version"] = AI_MODEL_FAST
        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Claude API call failed: {str(e)}")
