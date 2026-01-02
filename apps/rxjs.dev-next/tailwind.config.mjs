import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  // content: [
  // './**/*.{js,ts,vue,md,mdx}',
  // join(__dirname, '../../node_modules/@nuxt/ui/**/*.{js,ts,vue,md,mdx}'),
  // ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
