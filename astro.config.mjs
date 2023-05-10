import { defineConfig } from 'astro/config'
import tailwind from "@astrojs/tailwind"
import image from "@astrojs/image"
import mdx from "@astrojs/mdx"
import preact from "@astrojs/preact"
import sitemap from '@astrojs/sitemap'
import robotsTxt from "astro-robots-txt"

import compress from "astro-compress"

// https://astro.build/config
export default defineConfig( {
  site: 'https://velarshop.ru',
  integrations: [ tailwind(), image(), mdx(), preact(), sitemap(), robotsTxt( {
    sitemap: [ "https://velarshop.ru/sitemap-index.xml" ]
  } ), compress( {
    css: true,
    html: true,
  } ) ],
} )