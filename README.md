# Mobile App - MVP Project

React Native app built with Expo for the MVP project.

## Prerequisites

- Node.js 24 (LTS)
- pnpm
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio + Android Emulator (for Android development)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Update the API_BASE_URL in `.env` if needed:
   - For iOS Simulator: `http://localhost:3000`
   - For Android Emulator: `http://10.0.2.2:3000`
   - For physical device: Use your computer's IP address

## Development

Start the development server:

```bash
pnpm start
```

This will start Expo and show a QR code. You can:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your device

## Platform-specific Commands

### iOS

```bash
pnpm ios
```

### Android

```bash
pnpm android
```

### Web

```bash
pnpm web
```

## Features

- Health check screen that connects to backend
- Zustand state management
- React Navigation for routing
- AsyncStorage for local data persistence

## Environment Variables

See `.env.example` for required environment variables.

## Troubleshooting

### Cannot connect to backend

- Make sure backend is running on the correct port
- Update API_BASE_URL in your `.env` file
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's IP address

### Metro bundler issues

```bash
pnpm start --clear
```

## Deployment

```bash
npx eas update --branch main --message "Fixed status bar and header overlay issues for Android devices"
```
