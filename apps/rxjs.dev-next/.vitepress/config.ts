import { defineConfig, type UserConfig } from 'vitepress'
import type { DefaultTheme, Outline } from 'vitepress/theme'
import typedocSidebar from '../docs/api/typedoc-sidebar.json';
import ui from '@nuxt/ui/vite'


export default defineConfig({
  title: 'RxJS',
  description: 'Reactive Extensions Library for JavaScript',
  srcDir: 'docs',

  // Markdown configuration
  markdown: {
    // Shiki is enabled by default in VitePress
    // Code blocks will be highlighted automatically
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/favicons/favicon-96x96.png', sizes: '96x96' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/images/favicons/favicon.svg' }],
    ['link', { rel: 'shortcut icon', href: '/images/favicons/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicons/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }]
  ],

  vite: {
    plugins: [
      ui({
        router: false,
        ui: {
          colors: {
            primary: 'brand',
            neutral: 'zinc'
          }
        }
      }),
    ],
  },

  // Theme configuration
  themeConfig: {
    outline: {
      level: [2, 3, 4, 5] as Outline['level'],
    },
    logo: { src: '/images/favicons/favicon.svg', width: 24, height: 24 },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ReactiveX/rxjs' }
    ],
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Overview', link: '/guide/overview' },
      { text: 'API Reference', link: '/api' },
      {
        text: 'About',
        items: [
          { text: 'Team', link: '/team' },
          { text: 'Code of Conduct', link: '/code-of-conduct' }
        ]
      },

    ],
    sidebar: {
      '/guide': [
        {
          text: 'Overview',
          items: [
            { text: 'Introduction', link: '/guide/overview' },
            { text: 'Observables', link: '/guide/observable' },
            { text: 'Observer', link: '/guide/observer' },
            { text: 'Operators', link: '/guide/operators' },
            { text: 'Subscription', link: '/guide/subscription' },
            { text: 'Subjects', link: '/guide/subject' },
            { text: 'Scheduler', link: '/guide/scheduler' },
            { text: 'Marble Testing', link: '/guide/testing/marble-testing' }
          ]
        },
        {
          text: 'Installation',
          items: [
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Importing',
          items: [
            { text: 'Importing', link: '/guide/importing' }
          ]
        },
        {
          text: 'Glossary',
          items: [
            { text: 'Glossary', link: '/guide/glossary-and-semantics' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'API Overview', link: '/api' },
            { text: 'Index', link: '/api/index' },
            { text: 'Operators', link: '/api/operators' },
            { text: 'Ajax', link: '/api/ajax' },
            { text: 'Fetch', link: '/api/fetch' },
            { text: 'WebSocket', link: '/api/websocket' },
            { text: 'Testing', link: '/api/testing' }
          ]
        },
        {
          text: 'Deprecations & Breaking Changes',
          items: [
            { text: 'Breaking Changes', link: '/deprecations/breaking-changes' },
            { text: 'Scheduler Argument', link: '/deprecations/scheduler-argument' },
            { text: 'Subscribe Arguments', link: '/deprecations/subscribe-arguments' },
            { text: 'ResultSelector Arguments', link: '/deprecations/resultSelector' },
            { text: 'Array Arguments', link: '/deprecations/array-argument' },
            { text: 'Multicasting', link: '/deprecations/multicasting' },
            { text: 'Conversion to Promises', link: '/deprecations/to-promise' }
          ]
        },
        {
          text: 'Detailed Change List',
          items: [
            { text: 'Detailed Change List', link: '/6-to-7-change-summary' }
          ]
        },
      ],
      '/api': [
        {
          text: 'API Reference',
          items: typedocSidebar,
        }
      ]
    }
  },
} satisfies UserConfig<DefaultTheme.Config>);
