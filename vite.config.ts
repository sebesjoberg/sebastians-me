import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = defineConfig({
  server: {
    port: 3000,
    // the API runs on its own in dev (npm run dev in server/); in production
    // one server serves both the site and /api
    proxy: { '/api': 'http://localhost:8080' },
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    // Compiles messages/*.json into src/paraglide (gitignored).
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      // Locale comes from the URL only: "/" is Swedish, "/en" is English.
      strategy: ['url', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/',
          localized: [
            ['en', '/en'],
            ['sv', '/'],
          ],
        },
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/en/:path(.*)?'],
            // least specific last
            ['sv', '/:path(.*)?'],
          ],
        },
      ],
      emitTsDeclarations: true,
    }),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
  ],
});

export default config;
