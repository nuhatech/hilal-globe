// https://nuxt.com/docs/api/configuration/nuxt-config
const domainPath = new URL('./domain', import.meta.url).pathname
const contentPath = new URL('./content', import.meta.url).pathname

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
      meta: [
        { name: 'theme-color', content: '#060a14' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Hilal Globe' },
      ],
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/color-mode', '@nuxtjs/i18n'],

  i18n: {
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
    ],
  },

  colorMode: {
    classSuffix: '',
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  alias: {
    '@domain': domainPath,
    '@content': contentPath,
  },

  future: {
    compatibilityVersion: 4,
  },
})
