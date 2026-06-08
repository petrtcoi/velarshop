import type { ItemJson } from '@entities/Item'

type BreadcrumbItem = {
	title: string
	url: string
}

const SITE_URL = 'https://velarshop.ru'

function normalizeAbsoluteUrl(inputUrl: string): string {
	const url = new URL(inputUrl, SITE_URL)
	url.search = ''
	url.hash = ''
	return url.toString()
}

function toPrice(value: string): number | null {
	const parsed = Number.parseFloat(value)
	if (!Number.isFinite(parsed) || parsed <= 0) return null
	return parsed
}

export function getItemSeo(item: ItemJson) {
	const itemTitle = `Velar ${item.title}`
	const metaTitle = `${itemTitle} купить в магазине VelarShop.ru`
	const metaDescription = `Купить ${itemTitle} с доставкой по России. Помощь с подбором и консультация по совместимости.`
	const canonicalUrl = normalizeAbsoluteUrl(`/item/${item.slug}/`)
	const imageUrl = normalizeAbsoluteUrl(`/images/items/${item.image_slug || 'empty'}/main.jpg`)
	const price = toPrice(item.price)

	const breadcrumbs: BreadcrumbItem[] = [
		{ title: 'Главная', url: '/' },
		{ title: 'Комплектующие Velar', url: '/item/' },
		{ title: `${item.prefix} ${item.title}`, url: `/item/${item.slug}` },
	]

	const product: Record<string, unknown> = {
		'@type': 'Product',
		name: itemTitle,
		description: metaDescription,
		brand: {
			'@type': 'Brand',
			name: 'Velar',
		},
		url: canonicalUrl,
		image: [imageUrl],
	}

	if (price !== null) {
		product.offers = {
			'@type': 'Offer',
			priceCurrency: 'RUB',
			price: String(price),
			availability: 'https://schema.org/InStock',
			url: canonicalUrl,
		}
	}

	const breadcrumbList = {
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.title,
			item: normalizeAbsoluteUrl(item.url),
		})),
	}

	return {
		itemTitle,
		metaTitle,
		metaDescription,
		canonicalUrl,
		imageUrl,
		breadcrumbs,
		jsonLd: {
			'@context': 'https://schema.org',
			'@graph': [product, breadcrumbList],
		},
	}
}
