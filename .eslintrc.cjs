const eslintConfig = require("@keeex/eslint-config")({
  promise: false,
  mocha: true,
  typescript: "./tsconfig.json",
});

module.exports = eslintConfig;
