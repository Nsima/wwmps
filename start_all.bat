@echo off
echo Starting WWMPS Chatbot System...

REM Start Backend API
start "Backend API" cmd /k "cd backend && node --max-old-space-size=4096 index.js"

REM Start Vector Search Microservice
start "Vector Search" cmd /k "cd services\\vector_search && python search.py"

REM Start Frontend (Next.js)
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo All services are starting in separate windows...
