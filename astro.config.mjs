import mdx from '@astrojs/mdx'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

const NON_INDEXABLE_PATHS = new Set([
	'/cart',
	'/request',
	'/accepted',
	'/success',
])

const CANONICAL_ALIAS_PATHS = new Set([
	'/convector/kwh',
	'/convector/kwhv',
	'/convector/kwhv-24v',
	'/info/oshibki-pri-vybore-radiatorov-otopleniya',
	'/info/patina-i-tsveta-dlya-retro-radiatorov',
	'/info/radiatory-dlya-panoramnyh-okon',
	'/info/radiatory-s-ornamentom-kachestvo-litya',
	'/retro/historic',
	'/retro/nostalgia',
])

const LEGACY_COLUMN_MODEL_IDS = [
	'3020', '2030', '3030', '4030', '2037', '3037', '4037', '2040', '3040', '4040',
	'2045', '3045', '4045', '2050', '3050', '4050', '2052', '3052', '4052', '5052',
	'2055', '3055', '4055', '5055', '2057', '3057', '4057', '5057', '2060', '3060',
	'4060', '5060', '2075', '3075', '4075', '5075', '2090', '3090', '4090', '5090',
	'2100', '3100', '4100', '5100', '2110', '3110', '4110', '5110', '2120', '3120',
	'4120', '5120', '2150', '3150', '4150', '5150', '2180', '3180', '4180', '5180',
	'2200', '3200', '4200', '5200', '5030', '5037', '5040', '5045', '5050',
]

const legacyModelRedirects = Object.fromEntries(
	LEGACY_COLUMN_MODEL_IDS.map(id => [`/model/${id}`, `/columns/${id}`]),
)

function shouldIncludeInSitemap(page) {
	const pathname = new URL(page).pathname.replace(/\/+$/, '') || '/'
	if (NON_INDEXABLE_PATHS.has(pathname)) return false
	if (CANONICAL_ALIAS_PATHS.has(pathname)) return false
	// Product variants are canonicalized to parent model pages.
	if (/^\/model\/[^/]+\/[^/]+$/.test(pathname)) return false

	return true
}

// https://astro.build/config
export default defineConfig({
	site: 'https://velarshop.ru',
	trailingSlash: 'never',
	redirects: {
		'/info/raschet-sekciy-trubchatogo-radiatora-uglovaya-komnata':
			'/info/raschet-radiatorov-dlya-uglovoy-komnaty',
		...legacyModelRedirects,
	},
	integrations: [tailwind(), mdx(), preact(), sitemap({ filter: shouldIncludeInSitemap })],
})
