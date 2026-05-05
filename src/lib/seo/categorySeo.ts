type BreadcrumbItem = {
	title: string
	url: string
}

type CategoryItem = {
	name: string
	url: string
}

type FaqItem = {
	question: string
	answer: string
}

type CategoryData = {
	slug: string
	url: string
	name: string
	h1: string
	seoTitle: string
	seoDescription: string
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	ogImageAlt?: string
	heroImage?: string
	robots?: string
	indexable?: boolean
	faq?: FaqItem[]
	products?: CategoryItem[]
	breadcrumbs?: BreadcrumbItem[]
	itemListName?: string
}

type BuildCategoryJsonLdInput = {
	siteUrl: string
	canonicalUrl: string
	category: CategoryData
	products: CategoryItem[]
	faq: FaqItem[]
	breadcrumbs: BreadcrumbItem[]
}

type CategorySeoInput = {
	siteUrl?: string
	category: CategoryData
}

type CategorySeoResult = {
	title: string
	description: string
	canonicalUrl: string
	robots: string
	ogTitle: string
	ogDescription: string
	ogImage: string
	ogImageAlt: string
	twitterTitle: string
	twitterDescription: string
	twitterImage: string
	twitterImageAlt: string
	jsonLd: Record<string, unknown>
}

const DEFAULT_SITE_URL = 'https://velarshop.ru'

const categoryFallbackImageBySlug: Record<string, string> = {
	design: '/images/design/hero/vertical-design-radiator.jpg',
	columns: '/images/models/columns/hero-black-column-radiator.png',
	retro: '/images/retro/hero/nostalgia-section.jpg',
	convector: '/images/convector/hero/top-view-convector.png',
	floor: '/images/main/main0.jpg',
}

function normalizeAbsoluteUrl(inputUrl: string, siteUrl: string): string {
	const url = new URL(inputUrl, siteUrl)
	url.search = ''
	url.hash = ''
	if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
		url.pathname = url.pathname.replace(/\/+$/, '')
	}
	return url.toString()
}

function resolveCategoryImage(category: CategoryData, siteUrl: string): string {
	const source =
		category.ogImage ||
		category.heroImage ||
		categoryFallbackImageBySlug[category.slug] ||
		'/images/logo.png'
	return normalizeAbsoluteUrl(source, siteUrl)
}

function getDefaultBreadcrumbs(category: CategoryData): BreadcrumbItem[] {
	return [
		{ title: 'Главная', url: '/' },
		{ title: category.name, url: category.url },
	]
}

function sanitizeFaq(faq: FaqItem[]): FaqItem[] {
	return faq.filter(item => item.question.trim() && item.answer.trim())
}

function sanitizeItems(items: CategoryItem[]): CategoryItem[] {
	return items.filter(item => item.name.trim() && item.url.trim())
}

export function buildCategoryJsonLd(input: BuildCategoryJsonLdInput): Record<string, unknown> {
	const organizationId = `${input.siteUrl}/#organization`
	const websiteId = `${input.siteUrl}/#website`
	const breadcrumbId = `${input.canonicalUrl}#breadcrumb`
	const collectionId = `${input.canonicalUrl}#collection`
	const itemListId = `${input.canonicalUrl}#itemlist`
	const faqId = `${input.canonicalUrl}#faq`

	const breadcrumbList = {
		'@type': 'BreadcrumbList',
		'@id': breadcrumbId,
		itemListElement: input.breadcrumbs.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.title,
			item: normalizeAbsoluteUrl(item.url, input.siteUrl),
		})),
	}

	const itemList = {
		'@type': 'ItemList',
		'@id': itemListId,
		name: input.category.itemListName || `Модели раздела ${input.category.name}`,
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		numberOfItems: input.products.length,
		itemListElement: input.products.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: normalizeAbsoluteUrl(item.url, input.siteUrl),
			name: item.name,
		})),
	}

	const collectionPage = {
		'@type': 'CollectionPage',
		'@id': collectionId,
		url: input.canonicalUrl,
		name: input.category.h1,
		description: input.category.seoDescription,
		isPartOf: {
			'@id': websiteId,
		},
		breadcrumb: {
			'@id': breadcrumbId,
		},
		mainEntity: {
			'@id': itemListId,
		},
	}

	const graph: Record<string, unknown>[] = [
		{
			'@type': 'Organization',
			'@id': organizationId,
			name: 'VelarShop.ru',
			url: `${input.siteUrl}/`,
			logo: `${input.siteUrl}/images/logo.png`,
		},
		{
			'@type': 'WebSite',
			'@id': websiteId,
			url: `${input.siteUrl}/`,
			name: 'VelarShop.ru',
			publisher: {
				'@id': organizationId,
			},
		},
		breadcrumbList,
		collectionPage,
		itemList,
	]

	if (input.faq.length > 0) {
		graph.push({
			'@type': 'FAQPage',
			'@id': faqId,
			mainEntity: input.faq.map(item => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer,
				},
			})),
		})
	}

	return {
		'@context': 'https://schema.org',
		'@graph': graph,
	}
}

export function getCategorySeo(input: CategorySeoInput): CategorySeoResult {
	const siteUrl = input.siteUrl ?? DEFAULT_SITE_URL
	const canonicalUrl = normalizeAbsoluteUrl(input.category.url, siteUrl)
	const products = sanitizeItems(input.category.products ?? [])
	const faq = sanitizeFaq(input.category.faq ?? [])
	const breadcrumbs = input.category.breadcrumbs ?? getDefaultBreadcrumbs(input.category)
	const ogTitle = input.category.ogTitle ?? `${input.category.h1} — каталог Velar`
	const ogDescription =
		input.category.ogDescription ??
		'Выберите модель, размер, цвет и подключение. Поможем рассчитать мощность и доставку по России.'
	const ogImage = resolveCategoryImage(input.category, siteUrl)
	const ogImageAlt =
		input.category.ogImageAlt ??
		`${input.category.h1} Velar`
	const hasContent = Boolean(input.category.seoDescription.trim()) && products.length > 0
	const isIndexable = input.category.indexable ?? true
	const robots = input.category.robots ?? (isIndexable && hasContent ? 'index, follow' : 'noindex, follow')

	return {
		title: input.category.seoTitle,
		description: input.category.seoDescription,
		canonicalUrl,
		robots,
		ogTitle,
		ogDescription,
		ogImage,
		ogImageAlt,
		twitterTitle: ogTitle,
		twitterDescription: ogDescription,
		twitterImage: ogImage,
		twitterImageAlt: ogImageAlt,
		jsonLd: buildCategoryJsonLd({
			siteUrl,
			canonicalUrl,
			category: input.category,
			products,
			faq,
			breadcrumbs,
		}),
	}
}
