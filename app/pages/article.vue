<template>
  <div>
    <!-- Sticky header -->
    <header class="sticky top-0 z-10 border-b border-slate-200/50 bg-ocean-light/80 backdrop-blur-sm dark:border-white/10 dark:bg-ocean/80">
      <div class="mx-auto flex max-w-3xl items-center px-4 py-3 sm:px-6">
        <NuxtLink
          to="/"
          class="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Globe
        </NuxtLink>

        <button
          class="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
      </div>
    </header>

    <!-- Article body -->
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <article
        class="prose prose-slate prose-lg dark:prose-invert text-justify"
        v-html="renderedHtml"
      />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Sun, Moon } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import raw from '@content/between-the-eye-and-the-horizon-en.md?raw'

definePageMeta({
  layout: 'article',
})

useHead({
  title: 'Between the Eye and the Horizon — Hilal Globe',
  meta: [
    {
      name: 'description',
      content: 'Understanding Hilal Visibility Criteria, Testimony, and Physical Impossibility — An Islamic Perspective',
    },
  ],
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Configure markdown-it
const md = new MarkdownIt({
  html: true,
  typographer: true,
  linkify: true,
})

// External links open in new tab
const defaultLinkRender = md.renderer.rules.link_open
  || ((tokens: any[], idx: number, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens: any[], idx: number, options: any, env: any, self: any) => {
  const href = tokens[idx].attrGet('href')
  if (href && /^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkRender(tokens, idx, options, env, self)
}

// Render markdown
const baseHtml = md.render(raw)

// Post-process: add RTL attributes to paragraphs with Arabic text
const ARABIC_RE = /[\u0600-\u06FF]/g

function addRtlAttributes(html: string): string {
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (_match, inner) => {
    const textOnly = inner.replace(/<[^>]*>/g, '')
    const arabicChars = (textOnly.match(ARABIC_RE) || []).length
    const totalChars = textOnly.replace(/\s/g, '').length
    if (totalChars > 0 && arabicChars / totalChars > 0.4) {
      return `<p dir="rtl" class="rtl-quote">${inner}</p>`
    }
    return `<p>${inner}</p>`
  })
}

const renderedHtml = addRtlAttributes(baseHtml)
</script>
