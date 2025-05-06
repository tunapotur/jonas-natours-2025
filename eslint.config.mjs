import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, eslintPluginPrettierRecommended },
    extends: ['js/recommended'],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // Kullanılmayan değişken uyarılarında req|res|next|val olanları hariç tut
      'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val' }],
      'no-undef': 'warn',
      'no-console': 'warn',
    },
  },
]);
