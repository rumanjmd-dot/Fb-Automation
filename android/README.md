# FB Automation V5 - Android APK & Source

## 1. Direct APK Download (সরাসরি ডাউনলোড)
The compiled Android APK is located in:
- `public/FB_Automation_v5.apk`
- `public/downloads/FB_Automation_v5.apk`

You can download it directly from the app interface by clicking the **"APK"** or **"Download APK"** button, or navigate directly to `[Your-App-URL]/FB_Automation_v5.apk`.

## 2. Instant Android Home Screen Install (WebAPK)
Open the app link in Google Chrome on your Android mobile device:
1. Tap the top-right 3-dots (⋮) in Chrome.
2. Tap **"Install app"** or **"Add to Home screen"**.
3. It will install natively as an Android APK without any security warnings.

## 3. Building with Android Studio
1. Open this `/android` folder in **Android Studio**.
2. Wait for Gradle sync.
3. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Your custom signed or debug APK will be generated in `android/app/build/outputs/apk/release/app-release.apk`.
