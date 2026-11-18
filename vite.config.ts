// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: { plugins: [VitePWA({
    strategies: "generateSW", filename: "sw.js", outDir: "dist/client", injectRegister: null,
    registerType: "autoUpdate", devOptions: { enabled: false }, manifest: false,
    workbox: {
      globDirectory: "dist/client", globPatterns: ["**/*.{js,css,woff,woff2}"], maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: null, cleanupOutdatedCaches: true,
      runtimeCaching: [
        { urlPattern: ({ request, url }) => request.mode === "navigate" && url.origin === self.location.origin && /^\/admin\/?$/.test(url.pathname), handler: "NetworkFirst", options: { cacheName: "carina-admin-pages", networkTimeoutSeconds: 3, expiration: { maxEntries: 2 }, cacheableResponse: { statuses: [200] } } },
        { urlPattern: ({ url }) => url.origin === self.location.origin && /\/assets\/.*-[\w-]+\.(js|css|woff2?)$/.test(url.pathname), handler: "CacheFirst", options: { cacheName: "carina-hashed-assets", expiration: { maxEntries: 200 }, cacheableResponse: { statuses: [200] } } },
      ],
    },
  })] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
