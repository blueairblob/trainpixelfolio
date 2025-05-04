// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any additional configuration if needed
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Supabase fix
config.resolver.unstable_conditionNames = ["browser"];
config.resolver.unstable_enablePackageExports = false;

// Add resolver for Node.js modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
};

module.exports = config;