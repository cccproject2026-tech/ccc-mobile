# CCC-Mobile — Stack & Build Reference

Full stack and version details for **ccc-new-app** (Expo/React Native). Use this when taking a build or setting up a new environment.

---

## 1. Core runtime & framework

| Component | Version | Notes |
|-----------|---------|--------|
| **Node.js** | **20.19.x** (min) | Required for Expo SDK 54. Use LTS. |
| **npm** | 10.x (from Node 20) | Lockfile: `package-lock.json` (lockfileVersion 3). |
| **Expo SDK** | **54.0.33** | Resolved in lockfile. |
| **React** | **19.1.0** | React & React-DOM. |
| **React Native** | **0.81.5** | Bundled with Expo 54. |
| **React Native for Web** | ^0.21.0 | Web target. |
| **TypeScript** | **5.9.3** (lockfile) | package.json: ~5.9.2. |

---

## 2. Routing & navigation

| Package | Version |
|---------|---------|
| **expo-router** | 6.0.23 |
| **@react-navigation/native** | ^7.1.6 |
| **@react-navigation/bottom-tabs** | ^7.3.10 |
| **@react-navigation/drawer** | ^7.3.9 |
| **@react-navigation/elements** | ^2.3.8 |
| **react-native-screens** | ~4.16.0 |
| **react-native-safe-area-context** | ~5.6.0 |

- **Entry:** `main: "expo-router/entry"` in `package.json`.
- **Routing:** File-based (app directory). Typed routes enabled in `app.json` (`experiments.typedRoutes: true`).

---

## 3. Styling & UI

| Package | Version |
|---------|---------|
| **NativeWind** | ^4.1.23 |
| **Tailwind CSS** | ^3.4.17 |
| **react-native-css-interop** | ^0.2.1 |
| **@gluestack-ui/*** (icon, nativewind-utils, overlay, toast) | Various ^0.1.x / ^1.x |
| **@expo-google-fonts/albert-sans** | ^0.4.1 |
| **react-native-reanimated** | ~4.1.1 |
| **react-native-gesture-handler** | ~2.28.0 |
| **react-native-svg** | 15.12.1 |

- **Config:** `tailwind.config.js` (NativeWind preset, Gluestack plugin), `global.css` for Tailwind base.
- **Metro:** `metro.config.js` uses `withNativeWind(config, { input: './global.css' })`.
- **Babel:** `babel-preset-expo` + `nativewind/babel`, `jsxImportSource: "nativewind"`.

---

## 4. State, data & API

| Package | Version |
|---------|---------|
| **@tanstack/react-query** | ^5.90.6 |
| **axios** | ^1.13.1 |
| **zustand** | ^5.0.8 |
| **@react-native-async-storage/async-storage** | 2.2.0 |
| **expo-secure-store** | ~15.0.8 |
| **ajv** | ^8.17.1 |

- **API base URL:** From env `EXPO_PUBLIC_API_URL` (e.g. `https://app.wisdomtooth.tech`).
- **Timeout:** `EXPO_PUBLIC_API_TIMEOUT=15000` (ms).

---

## 5. Expo modules (aligned with SDK 54)

| Package | Version |
|---------|---------|
| expo-constants | ~18.0.13 |
| expo-dev-client | ~6.0.20 |
| expo-font | ~14.0.11 |
| expo-image | ~3.0.11 |
| expo-image-picker | ~17.0.10 |
| expo-document-picker | ~14.0.8 |
| expo-file-system | ~19.0.21 |
| expo-splash-screen | ~31.0.13 |
| expo-blur | ~15.0.8 |
| expo-linear-gradient | ~15.0.8 |
| expo-haptics | ~15.0.8 |
| expo-linking | ~8.0.11 |
| expo-media-library | ~18.2.1 |
| expo-web-browser | ~15.0.10 |
| expo-status-bar | ~3.0.9 |
| expo-system-ui | ~6.0.9 |
| expo-symbols | ~1.0.8 |

---

## 6. Native / device features

| Package | Version |
|---------|---------|
| **react-native-maps** | 1.20.1 |
| **@react-native-community/datetimepicker** | 8.4.4 |
| **@react-native-picker/picker** | 2.11.1 |
| **react-native-webview** | 13.15.0 |
| **react-native-keyboard-controller** | 1.18.5 |
| **@gorhom/bottom-sheet** | ^5.2.6 |
| **react-native-modal** | ^14.0.0-rc.1 |
| **zeego** | ^3.0.6 |
| **@react-native-menu/menu** | ^1.2.4 |
| **react-native-ios-context-menu** | ^3.2.1 |
| **react-native-calendars** | ^1.1313.0 |
| **react-native-signature-canvas** | ^5.0.2 |
| **react-native-pell-rich-editor** | ^1.10.0 |
| **react-native-otp-entry** | ^1.8.5 |
| **react-native-gifted-charts** | ^1.4.64 |
| **react-native-pie-chart** | ^4.0.1 |
| **react-native-view-shot** | 4.0.3 |
| **react-native-fs** | ^2.20.0 |

---

## 7. Build & tooling

| Tool | Version / config |
|------|------------------|
| **Babel** | @babel/core ^7.25.2 (lockfile: 7.29.0), babel-preset-expo ~54.0.10, babel-plugin-module-resolver ^5.0.2 |
| **Metro** | Expo default + NativeWind (`expo/metro-config`, withNativeWind) |
| **ESLint** | ^9.25.0, eslint-config-expo ~10.0.0 |
| **EAS (Expo Application Services)** | CLI >= 16.9.0 (`eas.json`) |

---

## 8. App & EAS build config

- **App name:** ccc-new-app  
- **Slug:** ccc-new-app  
- **Version:** 1.0.0  
- **Scheme:** cccnewapp  
- **New architecture:** `newArchEnabled: true`  
- **iOS:** bundleId `com.georgejose.cccnewapp`, supports tablet.  
- **Android:** package `com.georgejose.cccnewapp`, edge-to-edge, Google Maps config (replace placeholder key for production).  
- **Web:** Metro bundler, static output.

**EAS build profiles (`eas.json`):**

- **development** — development client, internal distribution.  
- **preview** — internal distribution.  
- **production** — autoIncrement enabled.  
- **submit.production** — for store submission.

---

## 9. Environment variables (for build/runtime)

- `EXPO_PUBLIC_API_URL` — e.g. `https://app.wisdomtooth.tech`  
- `EXPO_PUBLIC_API_TIMEOUT` — e.g. `15000`

Use EAS Secrets or `.env` (do not commit secrets). For production builds, set these in EAS or your CI.

---

## 10. Pre-build checklist

1. **Node:** 20.19.x (or current LTS matching Expo 54).  
2. **Install:** `npm ci` (uses `package-lock.json`).  
3. **Env:** Set `EXPO_PUBLIC_*` for the environment you’re building.  
4. **Android:** Replace Google Maps API key in `app.json` for production.  
5. **EAS:** Log in with `eas login`; ensure `eas.json` and app credentials are correct.  
6. **Builds:**  
   - Dev build: `eas build --profile development`  
   - Production: `eas build --profile production`  
   - Submit: `eas submit` (production).

---

## 11. Scripts (package.json)

- `npm start` — expo start  
- `npm run android` — expo start --android (DARK_MODE=media)  
- `npm run ios` — expo start --ios (DARK_MODE=media)  
- `npm run web` — expo start --web (DARK_MODE=media)  
- `npm run lint` — expo lint  
- `npm run reset-project` — node ./scripts/reset-project.js  

---

## 12. Lockfile & reproducibility

- **Lockfile:** `package-lock.json` (lockfileVersion 3).  
- For reproducible installs and builds, use **`npm ci`** (not `npm install`).  
- No `.nvmrc` or `.node-version` in repo; recommend adding Node **20.19.x** (or 20 LTS) for consistency.

This document reflects the project state at the time of generation. For the latest Expo 54 requirements, see [Expo SDK 54 reference](https://expo.dev/versions/v54.0.0).
