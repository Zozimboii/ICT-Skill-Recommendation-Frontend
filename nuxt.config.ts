// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss'],
    css: ['~/assets/css/tailwind.css', '~/assets/css/main.css'],
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
        },
    },
});
