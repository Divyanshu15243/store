@echo off
echo ========================================
echo Building Production Android App
echo ========================================
echo.

echo Step 1: Using production config...
copy capacitor.config.prod.ts capacitor.config.ts
echo Done!
echo.

echo Step 2: Syncing with Capacitor...
npx cap sync android
if errorlevel 1 (
    echo Capacitor sync failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo Production Build Ready!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx cap open android
echo 2. In Android Studio: Build > Generate Signed Bundle / APK
echo 3. Select APK or AAB
echo 4. Create/select keystore
echo 5. Build release version
echo.
pause
