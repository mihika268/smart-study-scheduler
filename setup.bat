@echo off
echo ================================================
echo    Smart Study Scheduler - Setup Script
echo ================================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

echo.
echo [3/4] Setup complete!
echo.
echo [4/4] Starting the application...
echo.
echo ================================================
echo   Smart Study Scheduler is starting...
echo   Open your browser and go to:
echo   http://localhost:3000
echo ================================================
echo.

call npm start
