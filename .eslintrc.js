module.exports = {
  extends: ["pretty-standard"],
  globals: {
    jest: false,
    fetch: false
  },
  plugins: ["prettier", "import"],
  rules: {
    "prettier/prettier": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/test/**/*.js"],
        optionalDependencies: false,
        peerDependencies: true
      }
    ]
  }
};
