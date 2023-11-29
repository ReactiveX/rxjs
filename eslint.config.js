const globals = require('globals');
const js = require('@eslint/js');
const eslintrc = require('@eslint/eslintrc');
const path = require('path');
const jsdoc = require('eslint-plugin-jsdoc');
const angular = require('@angular-eslint/eslint-plugin');

const compat = new eslintrc.FlatCompat({ baseDirectory: __dirname });

//   "eslint.experimental.useFlatConfig": true

module.exports = [
  { ignores: ['**/dist', '**/vite-bundle', '**/assets', 'apps/rxjs.dev/tools/transforms/**/*.template.js'] },
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parserOptions: { project: true, tsconfigRootDir: path.resolve('./packages/rxjs') },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/no-types': 'error',
    },
  },
  {
    files: ['apps/rxjs.dev/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jasmine,
      },
    },
  },
  {
    files: ['apps/rxjs.dev/**/*.ts', 'apps/rxjs.dev/**/*.mts'],
    plugins: {
      '@angular-eslint': angular,
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: path.resolve('./apps/rxjs.dev'),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',

      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/component-selector': ['error', { prefix: 'aio', style: 'kebab-case', type: 'element' }],
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/directive-selector': ['error', { prefix: 'aio', style: 'camelCase', type: 'attribute' }],
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
    },
  },
  {
    files: ['apps/rxjs.dev/tests/e2e/**/*.e2e-spec.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tests/e2e/tsconfig.e2e.json'],
        tsconfigRootDir: path.resolve('./apps/rxjs.dev'),
      },
    },
  },
];
