import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'examples/**'] },
  { files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } }, globals: globals.browser },
    plugins: { '@typescript-eslint': ts, react, 'react-hooks': hooks },
    settings: { react: { version: '18.3' } },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs['eslint-recommended'].overrides[0].rules,
      ...ts.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Props are checked by TypeScript; preserve the typed component API.
      'react/prop-types': 'off',
      // Preserve existing exported generic/metadata types rather than narrowing public API.
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      ...prettier.rules,
    },
  },
  { files: ['src/page-types/**/*.ts', 'src/hooks/useSearchParams.ts', 'src/services/DefaultRouteNavigator.ts', 'src/utils/react-router-override/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' } },
  { files: ['tests/**/*.{ts,tsx}'], languageOptions: { globals: globals.node } },
];
