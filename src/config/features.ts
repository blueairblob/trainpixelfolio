// src/config/features.ts
/**
 * Feature flags configuration for the Pica Loco app
 * Use these flags to enable/disable features for different releases
 */

// Environment-based feature flags
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// Main feature flags - modify these for different releases
export const FEATURES = {
  // Authentication features
  ENABLE_AUTHENTICATION: false, // Set to false for guest-only mode
  ENABLE_USER_REGISTRATION: false,
  ENABLE_LOGIN: false,
  FORCE_GUEST_MODE: true, // Force all users to be guests
  
  // Commerce features
  ENABLE_CART: false, // Set to false to hide cart functionality
  ENABLE_PURCHASES: false, // Set to false to hide purchase buttons
  ENABLE_PRICING: false, // Set to false to hide all pricing
  ENABLE_CHECKOUT: false,
  
  // Admin features
  ENABLE_ADMIN_PANEL: isDevelopment, // Only in dev for now
  ENABLE_USER_MANAGEMENT: false,
  
  // Social features
  ENABLE_FAVORITES: true, // Keep this for engagement
  ENABLE_SHARING: true,
  
  // Content features
  ENABLE_SEARCH: true,
  ENABLE_FILTERS: true,
  ENABLE_CATEGORIES: true,
  
  // Future features (for later releases)
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_SOCIAL_LOGIN: false,
} as const;

// Helper functions for feature checking
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

// Specific feature checks
export const canShowCart = () => isFeatureEnabled('ENABLE_CART');
export const canShowPricing = () => isFeatureEnabled('ENABLE_PRICING');
export const canShowAuth = () => isFeatureEnabled('ENABLE_AUTHENTICATION');
export const mustUseGuestMode = () => isFeatureEnabled('FORCE_GUEST_MODE');
export const canShowAdminPanel = () => isFeatureEnabled('ENABLE_ADMIN_PANEL');

// Release configurations
export const RELEASE_CONFIGS = {
  // TestFlight/App Store initial release - minimal features
  APP_STORE_INITIAL: {
    ENABLE_AUTHENTICATION: false,
    ENABLE_USER_REGISTRATION: false,
    ENABLE_LOGIN: false,
    FORCE_GUEST_MODE: true,
    ENABLE_CART: false,
    ENABLE_PURCHASES: false,
    ENABLE_PRICING: false,
    ENABLE_CHECKOUT: false,
    ENABLE_ADMIN_PANEL: false,
    ENABLE_USER_MANAGEMENT: false,
    ENABLE_FAVORITES: true,
    ENABLE_SHARING: true,
    ENABLE_SEARCH: true,
    ENABLE_FILTERS: true,
    ENABLE_CATEGORIES: true,
  },
  
  // Full feature release
  FULL_RELEASE: {
    ENABLE_AUTHENTICATION: true,
    ENABLE_USER_REGISTRATION: true,
    ENABLE_LOGIN: true,
    FORCE_GUEST_MODE: false,
    ENABLE_CART: true,
    ENABLE_PURCHASES: true,
    ENABLE_PRICING: true,
    ENABLE_CHECKOUT: true,
    ENABLE_ADMIN_PANEL: true,
    ENABLE_USER_MANAGEMENT: true,
    ENABLE_FAVORITES: true,
    ENABLE_SHARING: true,
    ENABLE_SEARCH: true,
    ENABLE_FILTERS: true,
    ENABLE_CATEGORIES: true,
  }
};

// Function to apply a release configuration
export const applyReleaseConfig = (configName: keyof typeof RELEASE_CONFIGS) => {
  const config = RELEASE_CONFIGS[configName];
  Object.assign(FEATURES, config);
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'Pica Loco',
  VERSION: '1.0.0',
  RELEASE_TYPE: 'APP_STORE_INITIAL' as keyof typeof RELEASE_CONFIGS,
  
  // Messages for disabled features
  MESSAGES: {
    CART_DISABLED: 'Shopping cart will be available in a future update.',
    AUTH_DISABLED: 'Account creation will be available in a future update.',
    PURCHASE_DISABLED: 'Photo purchasing will be available in a future update.',
    ADMIN_DISABLED: 'Admin features are not available in this version.',
  }
} as const;

// Initialize the app with the configured release type
applyReleaseConfig(APP_CONFIG.RELEASE_TYPE);