@echo off
echo ===================================================
echo   Smart Manufacturing Plant Management System
echo ===================================================

echo [1/3] Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    pause
    exit /b
)

echo [2/3] Starting Backend Server...
start "DSS Backend (FastAPI)" uvicorn app.main:app --reload --port 8000

echo [3/3] Starting Frontend Dashboard...
cd ../frontend
echo Installing Frontend Dependencies (if needed)...
call npm install
start "DSS Dashboard (React)" npm run dev

echo ===================================================
echo   SYSTEM ONLINE
echo   Backend: http://localhost:8000/docs
echo   Frontend: http://localhost:5173
echo ===================================================
pause
