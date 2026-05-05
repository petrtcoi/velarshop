type BreadcrumbItem = {
	title: string
	url: string
}

type SeriesVariant = {
	name: string
	url: string
	image?: string
}

type SeriesFaqItem = {
	question: string
	answer: string
}

type SeriesSeoData = {
	slug: string
	label: string
	title?: string
	url: string
	description?: string
	profile?: string
	category?: string
	image?: string
	ogImage?: string
	heroImage?: string
	breadcrumbs?: BreadcrumbItem[]
	variants: SeriesVariant[]
	faq?: SeriesFaqItem[]
	robots?: string
}

type BuildSeriesJsonLdInput = {
	siteUrl: string
	canonicalUrl: string
	series: SeriesSeoData
	variants: SeriesVariant[]
	faq: SeriesFaqItem[]
	breadcrumbs: BreadcrumbItem[]
}

type SeriesSeoInput = {
	siteUrl?: string
	series: SeriesSeoData
}

type SeriesSeoResult = {
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
const DESIGN_FALLBACK_OG_IMAGE = '/images/design/hero/vertical-design-radiator.jpg'

function normalizeAbsoluteUrl(inputUrl: string, siteUrl: string): string {
	const url = new URL(inputUrl, siteUrl)
	url.search = ''
	url.hash = ''
	if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
		url.pathname = url.pathname.replace(/\/+$/, '')
	}
	return url.toString()
}

function trimValue(value?: string): string {
	return (value || '').trim()
}

function getProfileShape(profile: string): string {
	const normalized = profile.toLowerCase()
	if (normalized.includes('квадрат')) return 'квадратная'
	if (normalized.includes('круг')) return 'круглая'
	if (normalized.includes('оваль')) return 'овальная'
	if (normalized.includes('плоск')) return 'плоская'
	return ''
}

function getProfileSize(profile: string): string {
	const match = profile.match(/(\d+\s?[xх]\s?\d+|\d+)\s*мм/iu)
	if (!match) return ''
	return match[1].replace(/\s+/g, '').replace(/[xх]/giu, '×')
}

function getProfileSuffix(profile: string): string {
	const normalized = profile.toLowerCase()
	if (normalized.includes('квадрат')) return 'с квадратным профилем'
	if (normalized.includes('круг')) return 'с круглым профилем'
	if (normalized.includes('оваль')) return 'с овальным профилем'
	if (normalized.includes('плоск')) return 'с плоским профилем'
	return 'серии Velar'
}

function buildSeriesTitle(label: string, profile: string): string {
	return `Velar ${label} — дизайн-радиатор ${getProfileSuffix(profile)}`
}

function buildSeriesDescription(params: {
	label: string
	profile: string
	orientationText: string
}): string {
	const profileSize = getProfileSize(params.profile)
	const profileShape = getProfileShape(params.profile)
	const shapeForProfile =
		profileShape === 'квадратная'
			? 'квадратным'
			: profileShape === 'круглая'
				? 'круглым'
				: profileShape === 'овальная'
					? 'овальным'
					: profileShape === 'плоская'
						? 'плоским'
						: ''
	const profilePart = shapeForProfile && profileSize
		? `с ${shapeForProfile} профилем ${profileSize} мм`
		: profileSize
			? `с профилем ${profileSize} мм`
			: ''
	const profileChunk = profilePart ? ` ${profilePart}` : ''
	return `Velar ${params.label} — серия дизайн-радиаторов${profileChunk}. Доступны ${params.orientationText}, цвета RAL, расчет и доставка по России.`
}

function getOrientationText(variants: SeriesVariant[]): string {
	const names = variants.map(item => item.name.toLowerCase())
	const hasV = names.some(name => name.endsWith(' v') || name.endsWith('v'))
	const hasH = names.some(name => name.endsWith(' h') || name.endsWith('h'))
	if (hasV && hasH) return 'вертикальная и горизонтальная версии'
	if (hasV) return 'вертикальная версия'
	if (hasH) return 'горизонтальная версия'
	return 'варианты исполнения'
}

function resolveSeriesImage(series: SeriesSeoData, variants: SeriesVariant[], siteUrl: string): string {
	const source =
		trimValue(series.ogImage) ||
		trimValue(series.heroImage) ||
		trimValue(variants[0]?.image) ||
		trimValue(series.image) ||
		DESIGN_FALLBACK_OG_IMAGE
	return normalizeAbsoluteUrl(source, siteUrl)
}

function getDefaultBreadcrumbs(series: SeriesSeoData): BreadcrumbItem[] {
	return [
		{ title: 'Главная', url: '/' },
		{ title: 'Дизайн-радиаторы', url: '/design' },
		{ title: `Velar ${series.label}`, url: series.url },
	]
}

function sanitizeFaq(faq: SeriesFaqItem[]): SeriesFaqItem[] {
	return faq.filter(item => trimValue(item.question) && trimValue(item.answer))
}

function sanitizeVariants(variants: SeriesVariant[]): SeriesVariant[] {
	return variants.filter(item => trimValue(item.name) && trimValue(item.url))
}

export function buildSeriesJsonLd(input: BuildSeriesJsonLdInput): Record<string, unknown> {
	const organizationId = `${input.siteUrl}/#organization`
	const websiteId = `${input.siteUrl}/#website`
	const breadcrumbId = `${input.canonicalUrl}#breadcrumb`
	const productGroupId = `${input.canonicalUrl}#product-group`
	const variantsId = `${input.canonicalUrl}#variants`

	const profile = trimValue(input.series.profile)
	const profileShape = getProfileShape(profile)
	const profileSize = getProfileSize(profile)
	const orientationText = getOrientationText(input.variants)

	const additionalProperty = [
		profileShape
			? {
					'@type': 'PropertyValue',
					name: 'Форма профиля',
					value: profileShape,
				}
			: null,
		profileSize
			? {
					'@type': 'PropertyValue',
					name: 'Размер профиля',
					value: `${profileSize} мм`,
				}
			: null,
		{
			'@type': 'PropertyValue',
			name: 'Варианты исполнения',
			value: orientationText,
		},
		{
			'@type': 'PropertyValue',
			name: 'Цвет',
			value: 'по каталогу RAL',
		},
	].filter(Boolean)

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

	const productGroup = {
		'@type': 'ProductGroup',
		'@id': productGroupId,
		name: `Velar ${input.series.label}`,
		url: input.canonicalUrl,
		description:
			trimValue(input.series.description) ||
			`Серия дизайн-радиаторов Velar ${input.series.label}. Доступные исполнения, размеры, цвета RAL, подбор мощности и подключения.`,
		brand: {
			'@type': 'Brand',
			name: 'Velar',
		},
		category: trimValue(input.series.category) || 'Дизайн-радиаторы',
		productGroupID: input.series.slug,
		variesBy: ['orientation', 'size', 'color', 'connection'],
		material: 'Сталь',
		additionalProperty,
		hasVariant: input.variants.map(item => ({
			'@type': 'Product',
			'@id': `${normalizeAbsoluteUrl(item.url, input.siteUrl)}#product`,
			name: item.name,
			url: normalizeAbsoluteUrl(item.url, input.siteUrl),
		})),
	}

	const variantsList = {
		'@type': 'ItemList',
		'@id': variantsId,
		name: `Варианты дизайн-радиатора Velar ${input.series.label}`,
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		numberOfItems: input.variants.length,
		itemListElement: input.variants.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: normalizeAbsoluteUrl(item.url, input.siteUrl),
			name: item.name,
		})),
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
		productGroup,
		variantsList,
	]

	if (input.faq.length > 0) {
		graph.push({
			'@type': 'FAQPage',
			'@id': `${input.canonicalUrl}#faq`,
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

export function getSeriesSeo(input: SeriesSeoInput): SeriesSeoResult {
	const siteUrl = input.siteUrl ?? DEFAULT_SITE_URL
	const variants = sanitizeVariants(input.series.variants)
	const breadcrumbs = input.series.breadcrumbs ?? getDefaultBreadcrumbs(input.series)
	const faq = sanitizeFaq(input.series.faq ?? [])
	const canonicalUrl = normalizeAbsoluteUrl(input.series.url, siteUrl)
	const profile = trimValue(input.series.profile)
	const orientationText = getOrientationText(variants)

	const title =
		trimValue(input.series.title) ||
		buildSeriesTitle(input.series.label, profile)
	const description =
		trimValue(input.series.description) ||
		buildSeriesDescription({
			label: input.series.label,
			profile,
			orientationText,
		})
	const ogTitle = title
	const profileShape = getProfileShape(profile)
	const profileSize = getProfileSize(profile)
	const shapeForProfile =
		profileShape === 'квадратная'
			? 'квадратный'
			: profileShape === 'круглая'
				? 'круглый'
				: profileShape === 'овальная'
					? 'овальный'
					: profileShape === 'плоская'
						? 'плоский'
						: ''
	const ogProfilePart = shapeForProfile && profileSize
		? `${shapeForProfile} профиль ${profileSize} мм`
		: profile || 'фирменный профиль'
	const ogDescription = `Серия Velar ${input.series.label}: ${orientationText}, ${ogProfilePart}, цвета RAL, подбор мощности и доставка по России.`
	const ogImage = resolveSeriesImage(input.series, variants, siteUrl)
	const ogImageAlt = `Дизайн-радиатор Velar ${input.series.label}`

	const hasContent = variants.length > 0 && description.length > 0
	const robots = input.series.robots || (hasContent ? 'index, follow' : 'noindex, follow')

	return {
		title,
		description,
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
		jsonLd: buildSeriesJsonLd({
			siteUrl,
			canonicalUrl,
			series: {
				...input.series,
				description,
			},
			variants,
			faq,
			breadcrumbs,
		}),
	}
}
