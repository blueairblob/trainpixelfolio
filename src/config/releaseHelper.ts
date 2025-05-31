// src/config/releaseHelper.ts
/**
 * Release Configuration Helper for Pica Loco
 * 
 * This file makes it easy to switch between different release configurations
 * without manually editing feature flags.
 * 
 * TO CHANGE RELEASE MODE:
 * 1. Simply change the CURRENT_RELEASE constant below
 * 2. Run the app - changes will take effect immediately
 */

import { FEATURES, RELEASE_CONFIGS, applyReleaseConfig } from './features';

// ========================================
// CHANGE THIS TO SWITCH RELEASE MODES
// ========================================
const CURRENT_RELEASE: keyof typeof RELEASE_CONFIGS = 'APP_STORE_INITIAL';
// Options:
// - 'APP_STORE_INITIAL': Guest-only mode for TestFlight/App Store review
// - 'FULL_RELEASE': All features enabled

// Apply the selected configuration
applyReleaseConfig(CURRENT_RELEASE);

// Export current configuration info
export const CURRENT_CONFIG = {
  mode: CURRENT_RELEASE,
  description: getCurrentConfigDescription(),
  features: { ...FEATURES }
};

function getCurrentConfigDescription(): string {
  switch (CURRENT_RELEASE) {
    case 'APP_STORE_INITIAL':
      return 'TestFlight/App Store Initial Release - Guest browsing only, no auth/cart features';
    case 'FULL_RELEASE':
      return 'Full Release - All features enabled including auth, cart, and admin';
    default:
      return 'Unknown configuration';
  }
}

// Development helper functions
export const debugFeatures = () => {
  if (__DEV__) {
    console.log('🎯 Current Release Configuration:', CURRENT_RELEASE);
    console.log('📝 Description:', getCurrentConfigDescription());
    console.log('🏗️ Feature Status:');
    console.log('   Authentication:', FEATURES.ENABLE_AUTHENTICATION ? '✅ Enabled' : '❌ Disabled');
    console.log('   Cart/Commerce:', FEATURES.ENABLE_CART ? '✅ Enabled' : '❌ Disabled');
    console.log('   Pricing:', FEATURES.ENABLE_PRICING ? '✅ Enabled' : '❌ Disabled');
    console.log('   Guest Mode:', FEATURES.FORCE_GUEST_MODE ? '✅ Forced' : '❌ Optional');
    console.log('   Admin Panel:', FEATURES.ENABLE_ADMIN_PANEL ? '✅ Enabled' : '❌ Disabled');
    console.log('   Favorites:', FEATURES.ENABLE_FAVORITES ? '✅ Enabled' : '❌ Disabled');
  }
};

// Quick configuration checks
export const isAppStoreMode = () => CURRENT_RELEASE === 'APP_STORE_INITIAL';
export const isFullMode = () => CURRENT_RELEASE === 'FULL_RELEASE';

// Feature flag quick checks (these mirror the functions in features.ts but provide context)
export const getFeatureStatus = () => ({
  authEnabled: FEATURES.ENABLE_AUTHENTICATION,
  cartEnabled: FEATURES.ENABLE_CART,
  pricingEnabled: FEATURES.ENABLE_PRICING,
  guestForced: FEATURES.FORCE_GUEST_MODE,
  adminEnabled: FEATURES.ENABLE_ADMIN_PANEL,
  favoritesEnabled: FEATURES.ENABLE_FAVORITES,
});

// Call debug function in development
if (__DEV__) {
  debugFeatures();
}