import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ui from '@nuxt/ui/vue-plugin'

import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(ui)
  },
} satisfies Theme
