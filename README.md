# AI-Powered Job Search Assistant 🔍

A full-stack platform that automates the job search cycle. It analyses your CV, finds matching job listings across platforms and generates tailored cover letters, so you spend less time on admin and more time applying.

## Why I built this

While looking for an internship, I kept running into the same problems:

- My CV wasn't always tailored to the specific role
- I skipped interesting jobs because they required a cover letter
- Keeping track of relevant listings across different job boards was time-consuming

As a graduate looking for my first developer role, including opportunities abroad in Australia, I wanted a tool that solves this for me and for other students and starters.

## Features

- **CV analysis & optimisation:** AI reviews your CV and gives concrete suggestions to improve it
- **Job scraping & matching:** collects listings from job boards and matches them to your profile, including roles you might have missed
- **Cover letter generation:** writes a personalised cover letter per company, so it's no longer a reason not to apply
- **Application dashboard:** keep track of all your applications in one place

## Tech stack

| Area | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| AI | Claude API (Anthropic) |
| Automation | n8n |
| Scraping | BeautifulSoup |
| Database | PostgreSQL |
| Frontend | React, TypeScript |

## How it works

1. You upload your CV, which the backend parses and sends to the Claude API for analysis.
2. n8n workflows trigger scrapers on a schedule to collect new job listings.
3. Listings are stored in PostgreSQL and scored against your profile.
4. For any match, you can generate a tailored cover letter with one click.
5. The React dashboard shows your matches, suggestions and application status.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- An [Anthropic API key](https://console.anthropic.com)

## What I learned

This project was my first deep dive into Python, AI APIs and workflow automation, on top of my C#/.NET background. Key takeaways:

- Designing prompts that give consistent, structured output from an LLM
- Building a REST API with FastAPI and connecting it to a React frontend
- Automating scraping pipelines with n8n
