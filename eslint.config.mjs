// Flat config for ESLint v9+
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import solidPlugin from 'eslint-plugin-solid';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts', '**/*.map'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: { vue: vuePlugin },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      ...vuePlugin.configs['vue3-recommended'].rules,
    },
  },
  {
    files: ['packages/solid-ui/**/*.{ts,tsx}'],
    plugins: { solid: solidPlugin },
    rules: {
      ...(solidPlugin.configs.typescript?.rules ?? {}),
      'solid/reactivity': 'off',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,ts}', '**/*.config.{js,cjs,ts,mjs}', '**/vite.config.ts', '**/tsup.config.ts'],
    languageOptions: { globals: globals.node },
  },
  prettier,
];


