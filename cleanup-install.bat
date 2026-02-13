@echo off
echo ========================================
echo GetStream Cleanup - Reinstall Dependencies
echo ========================================
echo.

echo Step 1: Cleaning Backend...
cd backend
if exist node_modules (
    echo Removing backend node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing backend package-lock.json...
    del package-lock.json
)
echo Installing backend dependencies...
call npm install
echo Backend cleanup complete!
echo.

echo Step 2: Cleaning Frontend...
cd ..\frontend
if exist node_modules (
    echo Removing frontend node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing frontend package-lock.json...
    del package-lock.json
)
echo Installing frontend dependencies...
call npm install
echo Frontend cleanup complete!
echo.

cd ..
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Remove GetStream variables from your .env files
echo 2. Start backend: cd backend ^&^& npm start
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo 4. Test video calls with two browsers
echo.
echo See CLEANUP_COMPLETE.md for full details
echo.
pause
