@echo off
REM Virtual Classroom Development Startup Script (Windows)
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo  Virtual Classroom Development Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo [INSTALL] Installing frontend dependencies...
    call npm install
    echo.
)

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo [INSTALL] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

REM Check if backend .env exists
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found
    echo Creating from .env.example...
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env - please update with your credentials
    echo.
)

echo.
echo ========================================
echo  Starting Servers
echo ========================================
echo.
echo [BACKEND] Starting on port 3001...
echo [FRONTEND] Starting on port 5173...
echo.
echo ========================================
echo  Virtual Classroom is Ready!
echo ========================================
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo.
echo  Demo Login:
echo  Email:    tutor@example.com
echo  Password: password
echo.
echo ========================================
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "Virtual Classroom Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in current window
npm run dev

REM Note: Closing this window will stop frontend but backend will keep running
REM Close the "Virtual Classroom Backend" window manually to stop it
