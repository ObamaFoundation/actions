/* eslint-env node */
module.exports = {
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint'],
  root: true,
  rules: {
    "@typescript-eslint/quotes": [
      "error", "double", {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ]
  }
};
