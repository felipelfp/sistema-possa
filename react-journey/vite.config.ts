import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Sistema Possa',
                short_name: 'Possa',
                description: 'Sistema de Controle de Entregas e Finanças',
                theme_color: '#0A0B1A',
                background_color: '#0A0B1A',
                display: 'standalone',
                icons: [
                    {
                        src: 'icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
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
