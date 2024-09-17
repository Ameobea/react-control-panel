import babel from 'eslint-plugin-babel';
import react from 'eslint-plugin-react';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('eslint:recommended', 'plugin:react/recommended'),
  {
    plugins: {
      babel,
      react,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        require: true,
        module: true,
        __dirname: true,
      },

      parser: babelParser,
      ecmaVersion: 2017,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        pragma: 'React',
        version: '16.5',
      },
    },

    rules: {
      indent: 0,
      quotes: [2, 'single'],
      'react/display-name': 0,
      'react/forbid-component-props': 0,

      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.js', '.jsx', '.tsx'],
        },
      ],

      'react/jsx-handler-names': 0,
      'react/jsx-indent': [1, 2],
      'react/jsx-indent-props': [1, 2],

      'react/jsx-max-props-per-line': [
        1,
        {
          maximum: 5,
          when: 'multiline',
        },
      ],

      'react/jsx-no-literals': 0,
      'react/jsx-sort-props': 0,
      'react/no-multi-comp': 0,
      'react/no-set-state': 0,
      'react/prop-types': 0,
      'linebreak-style': [2, 'unix'],
      semi: [2, 'always'],
      'comma-dangle': [2, 'only-multiline'],
      'no-console': 0,
      'no-global-assign': 0,

      'no-unused-vars': [
        1,
        {
          vars: 'all',
          args: 'none',
          argsIgnorePattern: '^_.*$',
        },
      ],

      'no-multiple-empty-lines': [
        2,
        {
          max: 1,
        },
      ],

      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
    },
  },
];
