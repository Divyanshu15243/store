# Quick Start - Build Your Mobile App

## 🚀 Build Your App in 3 Steps

### Step 1: Build the App
Run the automated build script:
```bash
build-mobile.bat
```

OR use npm command:
```bash
npm run build:mobile
```

### Step 2: Open in IDE

**For Android:**
```bash
npm run open:android
```
This opens Android Studio where you can build and run your app.

**For iOS (Mac only):**
```bash
npm run open:ios
```
This opens Xcode where you can build and run your app.

### Step 3: Build Release Version

**Android APK:**
1. In Android Studio: Build > Generate Signed Bundle / APK
2. Select APK
3. Create/select keystore
4. Build release

**iOS IPA (Mac only):**
1. In Xcode: Product > Archive
2. Distribute App
3. Export IPA

---

## 📱 What You Get

- **App Name**: DBS Media Tech
- **Package ID**: com.dbsmediatech.store
- **Platforms**: Android & iOS

---

## ⚠️ Important Before Building

### 1. Update API URL for Production
Your app currently connects to `localhost:5055`. For production:

Edit `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com
```

### 2. Install Required Software

**For Android:**
- Download Android Studio: https://developer.android.com/studio
- Install Android SDK (API 33+)

**For iOS (Mac only):**
- Install Xcode from Mac App Store
- Install Command Line Tools

---

## 🎨 Customize Your App

### Change App Name
Edit `capacitor.config.ts`:
```typescript
appName: 'Your App Name'
```

### Change Package ID
Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.appname'
```

### Add App Icon & Splash Screen
1. Install asset generator:
```bash
npm install -g @capacitor/assets
```

2. Generate assets:
```bash
npx capacitor-assets generate --iconPath icon.png --splashPath splash.png
```

---

## 🆘 Need Help?

See full documentation: `MOBILE_APP_GUIDE.md`

Common commands:
- `npm run build:mobile` - Build app
- `npm run open:android` - Open Android Studio
- `npm run open:ios` - Open Xcode
- `npm run cap:sync` - Sync changes to native projects

---

**Ready to build? Run:** `build-mobile.bat`
