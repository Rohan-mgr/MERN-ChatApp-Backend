module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  globals: {
    process: true,
  },
  rules: {
    "no-prototype-builtins": "off",
    "no-unused-vars": [
      "error",
      {
        args: "none", // do not check unused function arguments
      },
    ],
  },
};
