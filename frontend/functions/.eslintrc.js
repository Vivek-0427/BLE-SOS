/* global module */

module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "commonjs",
  },

  globals: {
    module: "readonly",
    require: "readonly",
    exports: "readonly",
  },

  rules: {
    "no-undef": "off",
  },

  ignorePatterns: [
    ".eslintrc.js",
    "eslint-config.txt",
  ],
};