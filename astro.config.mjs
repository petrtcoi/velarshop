import image from '@astrojs/image'
import mdx from '@astrojs/mdx'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

const NON_INDEXABLE_PATHS = new Set([
	'/cart/',
	'/request/',
	'/accepted/',
	'/success/',
])

function shouldIncludeInSitemap(page) {
	const pathname = new URL(page).pathname
	if (NON_INDEXABLE_PATHS.has(pathname)) return false
	// Product variants are canonicalized to parent model pages.
	if (/^\/model\/[^/]+\/[^/]+\/$/.test(pathname)) return false

	return true
}

// https://astro.build/config
export default defineConfig({
	site: 'https://velarshop.ru',
	integrations: [tailwind(), image(), mdx(), preact(), sitemap({ filter: shouldIncludeInSitemap })],
})
