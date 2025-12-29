// Shiki is already integrated in VitePress by default
// This file can be used for custom Shiki configuration if needed

import type { UserConfig } from 'vitepress';

// VitePress uses Shiki by default for syntax highlighting
// No additional configuration needed unless we want custom themes or languages

export const shikiConfig = {
  // VitePress default Shiki theme
  theme: 'github-dark',
  // Additional languages can be added here if needed
  langs: ['typescript', 'javascript', 'json', 'bash'],
};

