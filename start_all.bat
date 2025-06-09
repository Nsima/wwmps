@echo off
setlocal enabledelayedexpansion

echo Starting WWMPS Chatbot System...
echo.

REM Ask user for model preference
set /p modelChoice="Use OpenAI API? (y/n): "

if /i "%modelChoice%"=="y" (
    set USE_OPENAI=true
) else (
    set USE_OPENAI=false
)

echo Selected: USE_OPENAI=%USE_OPENAI%
echo.

REM Start Backend API with env variable
start "Backend API" cmd /k "cd backend && set USE_OPENAI=%USE_OPENAI% && node --max-old-space-size=4096 index.js"

REM Start Vector Search Microservice
start "Vector Search" cmd /k "cd services\\vector_search && python search.py"

REM Start Frontend (Next.js)
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services are starting in separate windows...
