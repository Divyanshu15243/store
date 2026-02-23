# 🚀 Quick Production Build - Android App

## Build Production APK in 5 Minutes

### 1️⃣ Run Build Script
```bash
build-production.bat
```

### 2️⃣ Open Android Studio
```bash
npx cap open android
```

### 3️⃣ Generate Signed APK
- **Build > Generate Signed Bundle / APK**
- Select **APK**
- Create/Select Keystore
- Build **release**

### 4️⃣ Get Your APK
Location: `android/app/release/app-release.apk`

---

## 📱 Install on Device
```bash
adb install android/app/release/app-release.apk
```

---

## 🏪 Publish to Play Store
1. Build **AAB** instead of APK
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

---

## ⚙️ Configuration
- **Production URL**: https://www.n23gujaratibasket.com
- **App Name**: DBS Media Tech
- **Package**: com.dbsmediatech.store

---

## 📚 Full Guide
See: `PRODUCTION_BUILD_GUIDE.md`
