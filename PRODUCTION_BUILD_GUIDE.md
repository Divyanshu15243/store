# Production Android App Build Guide

## 🚀 Quick Production Build

### Step 1: Run Production Build Script
```bash
build-production.bat
```

This will:
- Configure app to use production URL: https://www.n23gujaratibasket.com
- Sync with Android project

### Step 2: Open Android Studio
```bash
npx cap open android
```

### Step 3: Build Release APK/AAB

#### Option A: Build APK (For direct distribution)
1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Select **APK**
3. Click **Next**

#### Option B: Build AAB (For Google Play Store)
1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Select **Android App Bundle (AAB)**
3. Click **Next**

### Step 4: Create/Select Keystore

#### First Time (Create New Keystore):
1. Click **Create new...**
2. Fill in details:
   - **Key store path**: Choose location (e.g., `D:\keystore\kachabazar.jks`)
   - **Password**: Create strong password (SAVE THIS!)
   - **Alias**: kachabazar-key
   - **Alias Password**: Create password (SAVE THIS!)
   - **Validity**: 25 years
   - **Certificate**:
     - First and Last Name: Your Name
     - Organization: DBS Media Tech
     - City: Surat
     - State: Gujarat
     - Country Code: IN
3. Click **OK**

#### Existing Keystore:
1. Click **Choose existing...**
2. Select your keystore file
3. Enter passwords

### Step 5: Build Release
1. Select **release** build variant
2. Click **Finish**
3. Wait for build to complete
4. APK/AAB will be in: `android/app/release/`

---

## 📱 App Configuration

### Current Settings:
- **App Name**: DBS Media Tech
- **Package ID**: com.dbsmediatech.store
- **Production URL**: https://www.n23gujaratibasket.com

### Change Production URL:
Edit `capacitor.config.prod.ts`:
```typescript
server: {
  url: 'https://your-production-url.com',
  cleartext: false
}
```

---

## 🔐 Keystore Security

### IMPORTANT - Save These:
- Keystore file location
- Keystore password
- Key alias
- Key password

**⚠️ WARNING**: If you lose your keystore, you cannot update your app on Google Play Store!

### Backup Your Keystore:
```bash
# Copy to safe location
copy D:\keystore\kachabazar.jks E:\backup\
```

---

## 📦 Publishing to Google Play Store

### Prerequisites:
1. Google Play Console account ($25 one-time fee)
2. Signed AAB file
3. App assets (icon, screenshots, description)

### Steps:
1. Go to: https://play.google.com/console
2. Create new app
3. Fill in store listing:
   - App name: DBS Media Tech
   - Short description
   - Full description
   - Screenshots (at least 2)
   - Feature graphic
   - App icon
4. Upload AAB file
5. Complete content rating questionnaire
6. Set pricing (Free/Paid)
7. Submit for review

---

## 🎨 Customize App

### Change App Name:
Edit `capacitor.config.prod.ts`:
```typescript
appName: 'Your App Name'
```

### Change Package ID:
Edit `capacitor.config.prod.ts`:
```typescript
appId: 'com.yourcompany.appname'
```

Then update in Android:
```bash
npx cap sync android
```

### Change App Icon:
1. Prepare icon (1024x1024 PNG)
2. Install asset generator:
```bash
npm install -g @capacitor/assets
```
3. Generate:
```bash
npx capacitor-assets generate --iconPath icon.png
```

### Change Splash Screen:
1. Prepare splash (2732x2732 PNG)
2. Generate:
```bash
npx capacitor-assets generate --splashPath splash.png
```

---

## 🧪 Testing

### Test on Physical Device:
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device via USB
4. In Android Studio: Run > Run 'app'

### Test on Emulator:
1. In Android Studio: Tools > Device Manager
2. Create Virtual Device
3. Run app on emulator

---

## 🔧 Troubleshooting

### Build Fails:
- Update Android Studio to latest version
- Update Android SDK
- Clean project: Build > Clean Project
- Rebuild: Build > Rebuild Project

### App Crashes:
- Check Android Logcat in Android Studio
- Verify production URL is accessible
- Check network permissions in AndroidManifest.xml

### Keystore Issues:
- Verify passwords are correct
- Check keystore file exists
- Ensure keystore is valid (not corrupted)

---

## 📋 Checklist Before Release

- [ ] Test app thoroughly on multiple devices
- [ ] Verify all features work with production API
- [ ] Update version code in `android/app/build.gradle`
- [ ] Update version name in `android/app/build.gradle`
- [ ] Test payment flows (if applicable)
- [ ] Verify app icon and splash screen
- [ ] Check app permissions
- [ ] Backup keystore file
- [ ] Prepare store listing assets
- [ ] Write release notes

---

## 📞 Support

For issues:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Docs: https://developer.android.com
- Google Play Console: https://support.google.com/googleplay/android-developer

---

**Version**: 1.0  
**Last Updated**: 2026
