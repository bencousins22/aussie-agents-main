import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icon.svg', 'icon-maskable.svg'],
      manifest: {
        name: 'Aussie Agents',
        short_name: 'Aussie Agents',
        description: 'Aussie Agents Web UI',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/public/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'az-public-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ['ded8067776d4e6c2-161-38-217-69.serveousercontent.com', '*.serveousercontent.com', '*.serveo.net', '*.localhost.run'],
    proxy: {
      // Proxy Aussie Agents API endpoints to local backend during dev.
      '^/(poll|message_async|message|settings_.*|csrf_token|health|projects|history_.*|upload_.*|upload|download_.*|get_work_dir_files|delete_work_dir_file|file_info|memory_dashboard|chat_.*|scheduler_.*|backup_.*|mcp_.*|notifications_.*|nudge|pause|restart|tunnel.*)$': {
        target: 'http://localhost:50080',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "",
        withCredentials: true,
        configure: (
          _proxy
        ) => {
          _proxy.on(
            'error',
            (err) => {
            console.log('proxy error', err);
          });
          _proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          _proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Also proxy any API handler endpoints that are served at the root.
      '^/(a2a|mcp)(/.*)?$': {
        target: 'http://localhost:50080',
        changeOrigin: true,
        secure: false,
      },
      // Serve legacy assets during dev if needed.
      '^/public/.*': {
        target: 'http://localhost:50080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
