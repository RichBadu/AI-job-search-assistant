# Source Code

## Project Structure

```
src/
├── backend/      # Python FastAPI backend
├── frontend/     # React + TypeScript frontend
└── n8n/          # n8n automation workflows
```

## Running the Project

**Backend:**

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

API: `http://localhost:8000`
Docs: `http://localhost:8000/api/docs`

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

**Database migrations:**

```bash
cd backend
alembic upgrade head
```

## Bronnenlijst

-> zie reports/README.md
