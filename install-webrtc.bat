@echo off
echo 🎥 Installing WebRTC Dependencies...
echo.

REM Backend
echo 📦 Installing backend dependencies...
cd backend
call npm install socket.io
echo ✅ Backend dependencies installed
echo.

REM Frontend
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install socket.io-client
echo ✅ Frontend dependencies installed
echo.

echo 🎉 Installation complete!
echo.
echo 📝 Next steps:
echo 1. Update SessionPage.jsx to use WebRTCVideoCall component
echo 2. Test with two browsers
echo 3. Remove GetStream dependencies when ready
echo.
echo 📚 See WEBRTC_IMPLEMENTATION_COMPLETE.md for full guide
echo.
pause
