
# TrainPhoto - Mobile App

A React Native mobile application for browsing and purchasing premium train photographs.

## Project Overview

TrainPhoto is a cross-platform mobile app built with React Native and Expo. The app allows users to:

- Browse a collection of high-quality train photographs
- Filter photos by category
- View detailed photo information
- Add photos to cart
- Manage user profile
- Admin functionality for content management

## Features

- **Authentication**: Login and signup functionality
- **Photo Gallery**: Browse photos with multiple view modes (grid, list, detail)
- **Shopping Cart**: Add items to cart and checkout
- **User Profiles**: View order history and favorites
- **Admin Dashboard**: Manage photos, users, and orders
- **Offline Support**: Local storage for data persistence

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage for local data persistence
- Ionicons for icons

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Emulator

## Getting Started

Follow these steps to get the project running on your local machine:

1. Clone the repository
   ```
   git clone https://github.com/yourusername/train-photo.git
   cd train-photo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the Expo development server
   ```
   npx expo start
   ```

4. Run on a simulator or device
   - Press 'i' to open in iOS Simulator
   - Press 'a' to open in Android Emulator
   - Scan the QR code with the Expo Go app on your device

## Project Structure

```
/train-photo
  ├── App.js             # Main application entry point
  ├── app.json           # Expo configuration
  ├── assets/            # Static assets
  ├── src/
  │   ├── components/    # Reusable UI components
  │   ├── screens/       # Screen components
  │   ├── services/      # API and data services
  │   └── utils/         # Utility functions
  ├── package.json       # Dependencies and scripts
  └── README.md          # Project documentation
```

## Demo Credentials

Use these credentials to test the application:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

- **Regular User**:
  - Email: user@example.com
  - Password: user123

## Building for Production

To create a production build:

1. For Android:
   ```
   expo build:android
   ```

2. For iOS:
   ```
   expo build:ios
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
