import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

export default defineConfig({
  title: 'unacy',
  description: 'Type-safe unit, format and type conversion library for TypeScript',
  base: '/unacy/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { property: 'og:title', content: 'unacy' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Type-safe unit, format and type conversion library for TypeScript'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://pradeepmouli.github.io/unacy/' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'unacy' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'Type-safe unit, format and type conversion library for TypeScript'
      }
    ]
  ],
  sitemap: {
    hostname: 'https://pradeepmouli.github.io/unacy'
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/pradeepmouli/unacy' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' }
          ]
        }
      ],
      '/api/': [{ text: 'API Reference', items: typedocSidebar }]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/pradeepmouli/unacy' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Pradeep Mouli'
    },
    search: { provider: 'local' }
  }
});
