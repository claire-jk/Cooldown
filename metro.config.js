const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 增加對 .bin 檔案的支持，這是載入 TF 模型必須的
config.resolver.assetExts.push('bin');

module.exports = config;