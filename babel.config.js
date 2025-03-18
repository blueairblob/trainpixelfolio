
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // For React Native specific transformations
      'react-native-reanimated/plugin',
    ],
  };
};
