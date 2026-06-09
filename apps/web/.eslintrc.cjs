module.exports = {
  root: true,
  extends: ["../../packages/eslint-config/base.json"],
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: [".next"],
};
