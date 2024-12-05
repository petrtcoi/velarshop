import image from '@astrojs/image'
import mdx from '@astrojs/mdx'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'

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
				{
					userAgent: 'Yandex',
					'Clean-param': 'etext',
				},
			],
		}),
	],
})
