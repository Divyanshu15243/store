@echo off
echo ========================================
echo Building DBS Media Tech Mobile App
echo ========================================
echo.

echo Step 1: Cleaning previous builds...
if exist out rmdir /s /q out
if exist android rmdir /s /q android
if exist ios rmdir /s /q ios
echo Done!
echo.

echo Step 2: Building Next.js app for mobile...
set NEXT_CONFIG_FILE=next.config.mobile.js
npx next build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 3: Syncing with Capacitor...
npx cap sync
if errorlevel 1 (
    echo Capacitor sync failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Android project: %cd%\android
echo iOS project: %cd%\ios
echo.
echo Next steps:
echo - For Android: npx cap open android
echo - For iOS: npx cap open ios
echo.
pause
