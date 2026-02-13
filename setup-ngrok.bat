@echo off
echo ========================================
echo ngrok Setup for URL Sharing
echo ========================================
echo.

echo This script will help you share your website via URL
echo.

:check_ngrok
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ngrok is not installed
    echo.
    echo Please install ngrok:
    echo 1. Go to: https://ngrok.com/download
    echo 2. Download and extract ngrok.exe
    echo 3. Add ngrok.exe to your PATH or run from its folder
    echo.
    pause
    exit /b 1
)

echo [+] ngrok is installed
echo.

:check_auth
ngrok config check >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ngrok auth token not configured
    echo.
    echo Please configure your auth token:
    echo 1. Sign up at: https://ngrok.com/signup
    echo 2. Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken
    echo 3. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo [+] ngrok is configured
echo.

echo ========================================
echo Starting Services
echo ========================================
echo.

echo [1/4] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

echo [2/4] Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/4] Starting ngrok for Backend (Port 3000)...
start "ngrok Backend" cmd /k "ngrok http 3000"
timeout /t 3 /nobreak >nul

echo [4/4] Starting ngrok for Frontend (Port 5173)...
start "ngrok Frontend" cmd /k "ngrok http 5173"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Follow these steps:
echo.
echo 1. Check the "ngrok Backend" window
echo    Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
echo.
echo 2. Check the "ngrok Frontend" window
echo    Copy the HTTPS URL (e.g., https://xyz789.ngrok.io)
echo.
echo 3. Update frontend/.env:
echo    VITE_API_URL=https://abc123.ngrok.io/api
echo.
echo 4. Update backend/.env:
echo    CLIENT_URL=https://xyz789.ngrok.io
echo.
echo 5. Restart Backend and Frontend servers
echo    (Close and reopen those windows)
echo.
echo 6. Share your Frontend URL with anyone!
echo    They can access it from anywhere in the world.
echo.
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping all services...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq ngrok Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq ngrok Frontend*" /T /F >nul 2>&1
echo All services stopped.
