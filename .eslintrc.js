module.exports = {
  env: { es6: true },
  extends: [
    "eslint:recommended", 
  ],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
  },
  "rules": {
    "max-len": ["warn", {"code": 80}],
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "no-trailing-spaces": ["error"],
    "semi": ["error", "always"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn"],
  }
};
