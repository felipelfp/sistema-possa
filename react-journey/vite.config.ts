import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.svg', 'icon.svg'],
            manifest: {
                name: 'Sistema Possa',
                short_name: 'Possa',
                description: 'Sistema de Controle de Entregas e Finanças',
                theme_color: '#0A0B1A',
                background_color: '#0A0B1A',
                display: 'standalone',
                start_url: './',
                scope: './',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: 'icon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    base: './', // Use relative paths for assets
    server: {
        host: true, // Listen on all network IP addresses
        port: 5173,
        open: true
    }
});
