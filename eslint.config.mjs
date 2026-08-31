import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // This project is not using the experimental React Compiler. These rules
      // otherwise reject established hydration and third-party table patterns.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
      // Admin previews accept blob URLs and Supabase-hosted user content.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: ['src/types/supabase.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
]);
