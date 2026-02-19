# DBS Media Tech Mobile App Setup Guide

## Overview
This guide will help you build native Android and iOS apps from your Next.js store using Capacitor.

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - Already installed ✓
2. **Android Studio** (for Android builds)
   - Download: https://developer.android.com/studio
   - Install Android SDK (API 33 or higher)
   - Set ANDROID_HOME environment variable
3. **Xcode** (for iOS builds - Mac only)
   - Download from Mac App Store
   - Install Command Line Tools

## Quick Start

### Option 1: Automated Build (Windows)
```bash
# Run the automated build script
build-mobile.bat
```

### Option 2: Manual Build
```bash
# Step 1: Clean previous builds
rmdir /s /q out android ios

# Step 2: Build Next.js app with mobile config
set NEXT_CONFIG_FILE=next.config.mobile.js
npx next build

# Step 3: Sync with Capacitor
npx cap sync
```

## Opening Projects

### Android
```bash
npx cap open android
```
This opens Android Studio where you can:
- Build APK/AAB files
- Run on emulator or physical device
- Configure app signing

### iOS (Mac only)
```bash
npx cap open ios
```
This opens Xcode where you can:
- Build IPA files
- Run on simulator or physical device
- Configure provisioning profiles

## Building Release Apps

### Android APK/AAB
1. Open Android Studio: `npx cap open android`
2. Go to **Build > Generate Signed Bundle / APK**
3. Choose **APK** or **Android App Bundle (AAB)**
4. Create or select keystore
5. Build release version

### iOS IPA (Mac only)
1. Open Xcode: `npx cap open ios`
2. Select **Product > Archive**
3. Distribute to App Store or Ad Hoc
4. Export IPA file

## Configuration

### App Details
- **App ID**: com.dbsmediatech.store
- **App Name**: DBS Media Tech
- **Config File**: capacitor.config.ts

### Customization
Edit `capacitor.config.ts` to change:
```typescript
{
  appId: 'com.dbsmediatech.store',  // Change package name
  appName: 'DBS Media Tech',         // Change app name
  webDir: 'out'                      // Output directory
}
```

### App Icons & Splash Screens
Place your assets in:
- Android: `android/app/src/main/res/`
- iOS: `ios/App/App/Assets.xcassets/`

Or use Capacitor asset generator:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconPath icon.png --splashPath splash.png
```

## Important Notes

### API Configuration
Your app connects to: `http://localhost:5055`

⚠️ **For production**, update API URL in your environment:
1. Edit `.env.local` or create `.env.production`
2. Change `NEXT_PUBLIC_API_BASE_URL` to your production API
3. Rebuild the app

### Internationalization (i18n)
The mobile build disables Next.js i18n due to static export limitations.
If you need multi-language support, implement client-side i18n.

### Image Optimization
Images are set to `unoptimized: true` for static export.
Consider optimizing images before adding them to the app.

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Clear Next.js cache: `rmdir /s /q .next`
- Check Node.js version: `node --version`

### Capacitor Sync Fails
- Verify capacitor.config.ts exists
- Check that `out` directory was created
- Run: `npx cap doctor`

### Android Studio Issues
- Verify ANDROID_HOME is set
- Update Android SDK to latest version
- Sync Gradle files in Android Studio

### iOS Build Issues (Mac)
- Update Xcode to latest version
- Install CocoaPods: `sudo gem install cocoapods`
- Run: `cd ios/App && pod install`

## Testing

### Test on Device
1. Enable USB debugging (Android) or Developer Mode (iOS)
2. Connect device via USB
3. Run from Android Studio or Xcode

### Test on Emulator
1. Create emulator in Android Studio or iOS Simulator
2. Run app from IDE

## Publishing

### Google Play Store
1. Build signed AAB
2. Create Google Play Console account
3. Upload AAB and complete store listing
4. Submit for review

### Apple App Store
1. Build IPA with distribution certificate
2. Create App Store Connect account
3. Upload via Xcode or Transporter
4. Submit for review

## Support
For issues or questions, refer to:
- Capacitor Docs: https://capacitorjs.com/docs
- Next.js Docs: https://nextjs.org/docs
- Android Docs: https://developer.android.com
- iOS Docs: https://developer.apple.com

---
**Version**: 1.0
**Last Updated**: 2024
