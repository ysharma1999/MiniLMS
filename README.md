# MiniLMS 🚀

MiniLMS is a modern, lightweight Learning Management System built with **React Native** and **Expo**. Designed with a dynamic, premium UI using **NativeWind** (Tailwind CSS for React Native), it offers an intuitive mobile learning experience.

## ✨ Features

- **Auth Flow**: Secure login and registration utilizing token-based authentication and secure device storage.
- **Course Exploration**: Browse, search, and filter a vast library of courses fetched from a remote API.
- **Interactive Course Content**: High-performance course content rendering via Android/iOS native `WebView`, using locally bundled HTML assets for maximum reliability and offline support.
- **Bookmarks & State Management**: Seamlessly bookmark favorite courses and track your enrollments instantly using **Zustand**.
- **Smart Push Notifications**: 
  - Immediate enrollment confirmations and milestone celebrations (e.g., "5 courses bookmarked!").
  - 24-hour inactivity reminders to keep users engaged.
  - Daily learning goals scheduled locally.
- **Offline & Network Awareness**: Built-in network status monitoring with graceful offline fallbacks and error boundaries.

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) via [Expo](https://expo.dev/) (SDK 50+)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS v3)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [Axios](https://axios-http.com/)
- **Notifications**: `expo-notifications`
- **Web Content**: `react-native-webview` & `expo-asset`

## 📂 Project Structure

```text
MiniLMS/
├── app/                  # Expo Router file-based navigation screens
│   ├── (auth)/           # Authentication screens (Login, Register)
│   ├── (course)/         # Course details and WebView renderer
│   ├── (tabs)/           # Main bottom tab screens (Home, Bookmarks, Profile)
│   ├── _layout.tsx       # Root layout and theme provider
│   └── index.tsx         # Initial entry point
├── assets/               # Static assets
│   ├── html/             # Local HTML templates for WebView injection
│   └── images/           # Images and icons
├── components/           # Reusable UI components
│   ├── ui/               # Primitive/Base UI components (ErrorBoundary, OfflineBanner)
│   ├── CourseCard.tsx    # Interactive course display card
│   └── SearchBar.tsx     # Custom search input
├── hooks/                # Custom React hooks (useAppInit, useNetwork)
├── services/             # External API integration and async storage logic
│   ├── api.ts            # Axios configuration and interceptors
│   ├── auth.ts           # Authentication service
│   ├── courses.ts        # Course fetching and mapping
│   └── storage.ts        # SecureStore and AsyncStorage wrappers
├── store/                # Zustand state management
│   ├── authStore.ts      # User session and auth state
│   └── courseStore.ts    # Course data, bookmarks, and enrollments
├── types/                # Global TypeScript definitions
└── utils/                # Helper functions
    └── notifications.ts  # Push notification scheduling and permissions
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app installed on your physical iOS or Android device.

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd MiniLMS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Metro Bundler**:
   ```bash
   npm start
   ```

4. **Run on a Device or Emulator**:
   - Press `a` to open the app on an Android Emulator.
   - Press `i` to open the app on an iOS Simulator.
   - Scan the QR code in the terminal using the **Expo Go** app on your physical device.

> **Note on Notifications & WebViews**: For testing push notifications and local HTML asset loading within WebViews, we highly recommend running the app on a **physical device** instead of an emulator.

## 🔒 Permissions & Privacy

This application requires the following permissions to function fully:
- **Notifications**: To schedule local reminders and course alerts.
- **Network Access**: To fetch course data and authenticate users.

## 📄 License

This project is licensed under the MIT License.
## 📱 Download & Install APK

You can directly download and try the latest version of the app:

👉 **[Download Latest APK](https://github.com/ysharma1999/MiniLMS/releases/latest)**

### 📦 Steps to Install
1. Download the APK file on your Android device
2. Go to **Settings → Security → Install unknown apps**
3. Enable permission for your browser/files app
4. Open the downloaded APK
5. Tap **Install**

> ⚠️ Note: This app is not from Play Store, so you need to allow installation manually.