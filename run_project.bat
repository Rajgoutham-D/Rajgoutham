@echo off
title AI Stone Quality Inspection System - Launcher
echo ========================================================
echo   AI-Based Stone Quality Inspection and Defect Detection
echo                  35%% Review Prototype
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching FastAPI Backend on http://localhost:8000...
start "StoneGuard Backend (FastAPI + YOLO11)" cmd /k "cd backend && python run_backend.py"

timeout /t 3 /nobreak > nul

echo [2/2] Launching React Frontend on http://localhost:5173...
start "StoneGuard Frontend (React + Vite)" cmd /k "cd frontend && npm.cmd run dev"

timeout /t 2 /nobreak > nul

echo.
echo Opening browser to http://localhost:5173...
start http://localhost:5173

echo.
echo Both servers started!
echo Close the terminal windows when you wish to stop the application.
echo ========================================================
pause
