// metro.config.js


// Temp: https://github.com/supabase/supabase-js/issues/1400
//  This file was placed here to solve the following error when goinf from Expo 52 to 53
// Android Bundling failed 2693ms node_modules\expo\AppEntry.js (1078 modules)
// The package at "node_modules\ws\lib\stream.js" attempted to import the Node standard library module "stream".
// It failed because the native React runtime does not include the Node standard library.
// Learn more: https://docs.expo.dev/workflow/using-libraries/#using-third-party-libraries

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase fix
config.resolver.unstable_conditionNames = ["browser"];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;