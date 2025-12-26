import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // 1. Ignorar carpetas
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', 'docker_data', 'logs'],
  },

  // 2. Configuración para todos los archivos JS y TS
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node, // Define variables globales como 'process', 'console', etc.
    },
  },

  // 3. Reglas recomendadas de JS (eslint:recommended)
  pluginJs.configs.recommended,

  // 4. Reglas recomendadas de TypeScript
  ...tseslint.configs.recommended,

  // 5. Configuración de Prettier para evitar conflictos con ESLint
  eslintConfigPrettier,

  // 6. Reglas personalizadas
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
];
