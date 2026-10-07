@echo off
title TasteMatch - School Stall Launcher
color 0E

echo ========================================================
echo       TASTEMATCH - STALL SERVER 1-CLICK LAUNCHER
echo ========================================================
echo.
echo [1/3] Navigating to project folder...
cd /d "%~dp0"

echo [2/3] Starting Mobile Phone Bridge (Port 3000)...
start "TasteMatch Phone Bridge" cmd /k "node scripts/phone-bridge.js"

echo [3/3] Starting Expo App Server (Port 8081)...
start "TasteMatch Expo Server" cmd /k "npx expo start"

timeout /t 5 >nul

echo Launching browser preview...
start http://localhost:8081

echo.
echo ========================================================
echo   SUCCESS! TASTEMATCH IS RUNNING INDEPENDENTLY!
echo.
echo   * Laptop Browser: http://localhost:8081
echo   * Phone URL:      http://192.168.2.2:3000
echo   * Stall Games:    http://localhost:8081/games
echo ========================================================
echo You can keep these two server windows open while at your stall.
pause
