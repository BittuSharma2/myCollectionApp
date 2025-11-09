module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      // This line tells the preset NOT to add reanimated automatically
      ['babel-preset-expo', { reanimated: false }]
    ],
    plugins: [
      // We ONLY add reanimated. It will load worklets by itself.
      // This must be last.
      'react-native-reanimated/plugin',
    ],
  };
};