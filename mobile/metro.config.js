const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

module.exports = (() => {
  // 1. Pega a configuração padrão do Expo
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return withNativeWind(config, { input: './global.css' });
})();