# Workout

An Expo / React Native workout tracker for iPhone and Android. Includes three bodyweight routines, a session timer, individual set completion, and workout history stored locally with AsyncStorage. No account or API key is needed. History stays on the device; uninstalling the app or clearing Expo Go data can remove it. Active sessions are not restored after the app is closed.

## Run on your phone

1. Install Node.js 22.13+ and the Expo Go app on your phone (use a version supporting Expo SDK 58).
2. In this directory, run `npm ci`, then `npm start`.
3. Connect your computer and phone to the same Wi-Fi. Scan the terminal QR code with Camera on iPhone or Expo Go on Android.

For a remote computer or networks that block LAN access, use `npx expo start --tunnel` instead. This requires Internet access to Expo and its tunnel provider, and may prompt to install `@expo/ngrok`. A cloud server's localhost/LAN QR code cannot be reached directly from your phone. Running the project on your own computer is the easiest option.

## Checks

- `npm run typecheck`
- `npm test`
- `npx expo export --platform all` compiles the Android and iOS JavaScript bundles. Native simulators/device testing are separate.

## Install as a standalone app

Expo Go is for development. To make a standalone Android install, use EAS Build: `npx eas-cli build:configure`, then `npx eas-cli build --platform android --profile preview`. An Expo account is required. The included preview profile produces an APK. iPhone installation outside Expo Go requires Apple signing and an appropriate Apple Developer account; use EAS development/ad hoc distribution or TestFlight. Bundle identifiers and signing should be configured for your account before building. No standalone build has been published by this project.
