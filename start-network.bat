@echo off
echo ========================================
echo Starting Servers for Network Access
echo ========================================
echo.

echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo.
echo ========================================
echo Your IP Address: %IP%
echo ========================================
echo.
echo Access your website from other devices:
echo Frontend: http://%IP%:5173
echo Backend:  http://%IP%:3000
echo.
echo IMPORTANT: Make sure to update backend/.env:
echo CLIENT_URL=http://%IP%:5173
echo.
echo ========================================
echo.

echo Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend with network access...
start "Frontend Server" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Network:  http://%IP%:5173
echo.
echo Press any key to stop servers...
pause >nul

echo Stopping servers...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1
echo Servers stopped.
