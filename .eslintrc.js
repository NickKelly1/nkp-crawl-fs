'use-strict';

/* eslint-env node */

/** @typedef {import('eslint').Linter.Config} Config */


/** @type {Config} */
const config = {
  ignorePatterns: ['dist/*', 'node_modules/*',],
  overrides: [
    {
      files: [
        '*.ts',
        '*.tsx',
        '*.js',
        '*.jsx',
      ],
      'env': {
        'browser': true,
        'es2021': true,
        'jest': true,
      },
      'extends': [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'eslint:recommended',
      ],
      'parser': '@typescript-eslint/parser',
      'parserOptions': {
        'ecmaVersion': 2021,
        'sourceType': ['module', 'commonjs',],
        'ecmaFeatures': {
          jsx: true, // Allows for the parsing of JSX
        },
      },
      'plugins': [
        '@typescript-eslint',
      ],
      rules: {
        'indent': ['error', 2, ],
        'linebreak-style': ['error', 'unix',],
        'quotes': ['error', 'single',],
        'semi': ['error', 'always',],
        'comma-dangle': ['error', {
          'functions': 'only-multiline',
          'objects': 'always',
          'arrays': 'always',
        },],
        'no-unused-vars': ['off',], // favour typescript's no-unused-vars
        'no-trailing-spaces': ['error', 'always',],
        '@typescript-eslint/ban-ts-comment': ['off',],
        '@typescript-eslint/no-non-null-assertion': ['off',],
      },
    },
  ],
};

module.exports = config;
