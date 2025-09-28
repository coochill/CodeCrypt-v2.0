# CodeCrypt v2.0 

Backend: Flask API (backend/)
Frontend: React + Vite + Tailwind (frontend/)

Quick Start:
Backend:
  cd backend
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  python -m pip install --upgrade pip
  pip install -r requirements.txt
  python app.py  (serves on http://localhost:5000)

Frontend:
  cd frontend
  npm install
  npm run dev (http://localhost:5173)

Copy backend/.env.example to backend/.env before starting.
Copy frontend/.env.example to frontend/.env and set VITE_API_URL.
