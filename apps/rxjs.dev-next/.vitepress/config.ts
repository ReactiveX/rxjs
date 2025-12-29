import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'RxJS',
  description: 'Reactive Extensions Library for JavaScript',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }]
  ],

  // Theme configuration
  themeConfig: {
    // Add your navigation and sidebar configuration here
    nav: [],
    sidebar: []
  }
})

