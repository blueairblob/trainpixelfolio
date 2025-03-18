
# TrainPhoto Mobile App

A React Native mobile application for train photography enthusiasts, built with Expo.

## Features

- Browse train photos by category
- View detailed information about photos
- Add photos to cart for purchase
- User authentication (login/register)
- Admin dashboard for content management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Clone the repository
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

## Project Structure

- `/src/screens` - Main application screens
- `/src/components` - Reusable UI components
- `/src/services` - API and business logic
- `/assets` - Images and other static assets

## Technologies Used

- React Native
- Expo
- React Navigation
- Async Storage for local data persistence
- Tailwind CSS (via TWRNC)
