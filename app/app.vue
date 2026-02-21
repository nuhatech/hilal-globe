<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({
  titleTemplate: (title) => title ? `${title} — Hilal Globe` : 'Hilal Globe',
  htmlAttrs: { lang: () => useI18n().locale.value },
})

useSeoMeta({
  ogSiteName: 'Hilal Globe',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://hilal-globe.pages.dev',
  description: () => t('seo.description'),
  ogDescription: () => t('seo.description'),
})
</script>
