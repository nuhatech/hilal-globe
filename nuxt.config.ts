// https://nuxt.com/docs/api/configuration/nuxt-config
const domainPath = new URL('./domain', import.meta.url).pathname

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/color-mode'],

  colorMode: {
    classSuffix: '',
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  alias: {
    '@domain': domainPath,
  },

  future: {
    compatibilityVersion: 4,
  },
})
