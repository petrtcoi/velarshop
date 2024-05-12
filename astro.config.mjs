import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import image from '@astrojs/image';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
  site: 'https://velarshop.ru',
  integrations: [
    tailwind(),
    image(),
    mdx(),
    preact(),
    sitemap(),
    robotsTxt({
      sitemap: ['https://velarshop.ru/sitemap-index.xml'],
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/model/*/*/'],
        },
      ],
    }),
  ],
});
