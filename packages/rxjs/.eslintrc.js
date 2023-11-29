module.exports = {
  ignorePatterns: ['**/dist'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    'no-prototype-builtins': 'off',
  },
  env: {
    browser: true,
    node: true,
  },
  overrides: [
    {
      files: 'spec/**/*.js',
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
