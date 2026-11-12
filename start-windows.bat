@echo off
cd /d "%~dp0"
if not exist .env.local (
  copy .env.example .env.local >nul
  echo Created .env.local - open it and paste your GEMINI_API_KEY, then run this file again.
  notepad .env.local
  pause
  exit /b
)
if not exist node_modules (
  echo Installing dependencies - first run only...
  call npm install
)
echo Starting Thread Den at http://localhost:3000
start "" http://localhost:3000
call npm run dev
pause
