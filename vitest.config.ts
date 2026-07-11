import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // @vitejs/plugin-react transforms JSX/TSX for tests regardless of the
  // Docusaurus tsconfig's jsx:'preserve' setting.
  plugins: [react()],
  resolve: {
    alias: {
      // @docusaurus/Link is only available at Docusaurus build time; stub it for tests.
      '@docusaurus/Link': fileURLToPath(new URL('./test/stubs/Link.tsx', import.meta.url)),
    },
  },
  test: {environment: 'node', include: ['src/**/*.test.{ts,tsx}']},
});
