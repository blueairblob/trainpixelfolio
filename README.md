
# TrainPhoto Mobile App

A React Native mobile application for train photography enthusiasts, built with Expo SDK 52.0.0.

## Features

- Browse train photos by category
- View detailed information about photos
- Add photos to cart for purchase
- User authentication (login/register)
- Admin dashboard for content management

## Color Scheme

- Primary: Dark Blue (#1A237E)
- Secondary: Red (#D32F2F)
- Background: White (#FFFFFF)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Clone the repository
```
git clone https://github.com/blueairblob/trainpixelfolio.git
cd trainpixelfolio
```

2. Install dependencies:
```
npm install
```

3. Start the Expo development server:
```
npx expo start
```

4. Run on a simulator or scan the QR code with the Expo Go app on your device

### Login Credentials

For testing purposes, you can use these accounts:

- Admin: admin@example.com / admin123
- Regular User: user@example.com / user123

## Deployment

This app can be deployed using Expo EAS Build:

```
npx eas build:configure
npx eas build --platform ios
npx eas build --platform android
```

## Project Structure

- `/src/screens` - Main application screens
- `/src/components` - Reusable UI components
- `/src/services` - API and business logic
- `/assets` - Images and other static assets

## Technologies Used

- React Native 0.78.0
- React 19.0.0
- Expo SDK 52.0.0
- React Navigation
- Async Storage for local data persistence
- Tailwind CSS (via TWRNC)
- Expo Vector Icons
