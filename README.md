# Stratify AI

Stratify AI is a startup intelligence platform that helps teams simulate business decisions and understand their impact in real time.

It combines:
- a React + Vite frontend for interactive strategy exploration
- a FastAPI backend for analysis and decision simulation
- an optional OpenAI-powered reasoning layer for strategy summaries, explanations, and actionable tasks

## Core Features

- Decision Mode: simulate actions like increasing price, adding a feature, or changing marketing spend
- Real-Time Strategy Playground: sliders and toggles update projected demand and revenue
- Why Explanation Engine: recommendation cards explain the reasoning and supporting signals
- Competitor Battle View: compare your startup against competitors on price, features, and positioning
- Risk Heatmap: visualize pricing, competition, churn, and feature risk
- Multi-Scenario Comparison: compare different pricing and growth strategies side by side
- Strategy Modes: switch between Growth, Profit, and Balanced modes
- Actionable Task Generator: turn analysis into concrete next steps

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts
- Backend: FastAPI, Pydantic
- AI Layer: OpenAI API with deterministic fallback logic

## Project Structure

```text
Stratify_AI/
├─ Stratify_backend/
│  ├─ main.py
│  ├─ models/
│  └─ services/
└─ Stratify_frontend/
   ├─ src/
   ├─ public/
   └─ package.json
```

## How It Works

The frontend sends a startup profile, competitor data, and scenarios to the backend.  
The backend computes fast deterministic metrics such as:

- demand score
- revenue projection
- pricing gap
- feature gap
- risk score

If `OPENAI_API_KEY` is available, the backend also generates:

- strategy summaries
- deeper explanations
- AI recommendations
- action tasks

If the key is not available, the system still works using fallback logic.

## Running Locally

### 1. Backend

```powershell
cd D:\Stratify_AI\Stratify_backend
python -m pip install -r requirements.txt
copy .env.example .env
```

Add your OpenAI key to `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Then run:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend

```powershell
cd D:\Stratify_AI\Stratify_frontend
npm install
```

Create `.env.local` if needed:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run:

```powershell
npm run dev
```

Open the app in the browser on the port shown by Vite.

## API Endpoints

- `GET /` - backend status and LLM status
- `GET /health` - health check
- `POST /analyze` - returns full startup intelligence response
- `POST /decision-mode` - simulates a single business decision

## Notes

- `Stratify_backend/.env` is intentionally ignored from Git
- the app works without OpenAI, but advanced AI reasoning is disabled
- frontend and backend should be running together for the dashboard to load properly

## Future Improvements

- persistent database for startup profiles and saved scenarios
- authentication and multi-user workspaces
- deployment for production use
- richer competitor ingestion and analytics
- exportable reports and charts

## Author

Built by Manmeet Kaur.
