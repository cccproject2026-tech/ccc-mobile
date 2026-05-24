const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { fixAllUnderRoot } = require('./scripts/encoding-utils');

// Fix UTF-16 files before Metro starts (covers `npx expo start`, not only `npm start`).
fixAllUnderRoot({ log: true });

const config = getDefaultConfig(__dirname);

// Re-encode on every transform so a bad save during dev cannot break the bundle.
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./scripts/metro-babel-transformer'),
};

module.exports = withNativeWind(config, { input: './global.css' });