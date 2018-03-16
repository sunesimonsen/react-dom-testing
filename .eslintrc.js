module.exports = {
  extends: ["pretty-standard"],
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
