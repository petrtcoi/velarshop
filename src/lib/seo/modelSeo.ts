import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { getModelMainImagePath } from '@shared/utils/getModelMainImagePath'

type BreadcrumbItem = {
	title: string
	url: string
}

type ModelFaqItem = {
	question: string
	answer: string
}

type ModelSpecItem = {
	label: string
	value: string
}

type ParentSeries = {
	slug: string
	title: string
	url: string
}

type BuildModelJsonLdInput = {
	siteUrl: string
	canonicalUrl: string
	model: ModelJson
	productName: string
	description: string
	categoryLabel: string
	breadcrumbs: BreadcrumbItem[]
	imageUrl: string
	priceMin?: number
	priceMax?: number
	offerCount?: number
	availabilityUrl: string
	additionalProperties: ModelSpecItem[]
	parentSeries?: ParentSeries
	faqItems: ModelFaqItem[]
	includeFaq: boolean
}

type ModelSeoInput = {
	siteUrl?: string
	model: ModelJson
	radiators: RadiatorJson[]
	breadcrumbs: BreadcrumbItem[]
	parentSeries?: ParentSeries
	faqItems: ModelFaqItem[]
	additionalProperties: ModelSpecItem[]
	categoryLabel: string
	heroDescription?: string
}

type ModelSeoResult = {
	title: string
	description: string
	canonicalUrl: string
	ogTitle: string
	ogDescription: string
	ogImage: string
	ogImageAlt: string
	twitterTitle: string
	twitterDescription: string
	twitterImage: string
	twitterImageAlt: string
	robots: string
	productMeta: {
		brand: string
		availability: string
		condition: string
		priceAmount?: string
		priceCurrency?: string
	}
	jsonLd: Record<string, unknown>
	priceMin?: number
	priceMax?: number
}

const DEFAULT_SITE_URL = 'https://velarshop.ru'

const categoryFallbackImages: Record<ModelJson['type'], string> = {
	design: '/images/design/hero/vertical-design-radiator.jpg',
	convector: '/images/convector/hero/top-view-convector.png',
	floor: '/images/main/main0.jpg',
	ironcast: '/images/retro/hero/nostalgia-section.jpg',
	columns: '/images/models/columns/hero-black-column-radiator.png',
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

function toNumber(value?: string): number {
	if (!value) return 0
	const parsed = Number.parseFloat(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function capitalizeFirst(value: string): string {
	if (!value) return value
	return value[0].toUpperCase() + value.slice(1)
}

function normalizeModelName(name: string): string {
	return name.replace(/([A-Za-zА-Яа-я])\s+(\d+)/g, '$1$2').replace(/\s+/g, ' ').trim()
}

function getOrientationLabel(model: ModelJson): string {
	if (model.orientation === 'horizontal') return 'горизонтальный'
	if (model.orientation === 'vertical') return 'вертикальный'
	return ''
}

function getProfilePhrase(comment: string): string {
	const normalized = comment.toLowerCase()
	const sizeMatch = comment.match(/(\d+\s?[xх]\s?\d+|\d+)\s*мм/iu)
	const size = sizeMatch?.[1]?.replace(/\s+/g, '').replace(/[xх]/giu, '×')

	let shape = ''
	if (normalized.includes('квадрат')) shape = 'квадратным профилем'
	if (normalized.includes('круг')) shape = 'круглым профилем'
	if (normalized.includes('оваль')) shape = 'овальным профилем'
	if (normalized.includes('плоск')) shape = 'плоским профилем'

	if (shape && size) return `с ${shape} ${size} мм`
	if (shape) return `с ${shape}`
	if (size) return `с профилем ${size} мм`
	return ''
}

function buildModelDescription(params: {
	modelFullName: string
	orientationLabel: string
	isDesign: boolean
	prefix: string
	profilePhrase: string
}): string {
	const { modelFullName, orientationLabel, isDesign, prefix, profilePhrase } = params
	const descriptor = isDesign
		? orientationLabel
			? `${capitalizeFirst(orientationLabel)} дизайн-радиатор`
			: 'Дизайн-радиатор'
		: `${capitalizeFirst(prefix.toLowerCase())}`
	const profileChunk = profilePhrase ? ` ${profilePhrase}` : ''

	return `Купить ${modelFullName} с доставкой по России. ${descriptor} Velar${profileChunk}: подбор размера, цвета RAL и подключения.`
}

function getOgDescription(params: {
	priceMin?: number
	orientationLabel: string
	profilePhrase: string
}): string {
	const descriptor = params.orientationLabel
		? `${capitalizeFirst(params.orientationLabel)} дизайн-радиатор`
		: 'Дизайн-радиатор'
	const priceChunk = params.priceMin ? `Цена от ${params.priceMin.toLocaleString('ru-RU')} ₽. ` : ''
	const profileChunk = params.profilePhrase ? ` ${params.profilePhrase}` : ''
	return `${priceChunk}${descriptor}${profileChunk}. Подбор размера, цвета RAL, подключения и доставка по России.`
}

function getMaterialValue(model: ModelJson): string {
	if (model.type === 'ironcast') return 'Чугун'
	return 'Сталь'
}

function resolveModelImage(model: ModelJson, siteUrl: string): string {
	const source = model as unknown as {
		ogImage?: string
		heroImage?: string
		images?: Array<string | { src?: string; url?: string }>
	}

	const dynamicImage = source.ogImage || source.heroImage
	if (dynamicImage && dynamicImage.trim()) {
		return normalizeAbsoluteUrl(dynamicImage, siteUrl)
	}

	const firstImage = source.images?.[0]
	if (typeof firstImage === 'string' && firstImage.trim()) {
		return normalizeAbsoluteUrl(firstImage, siteUrl)
	}
	if (firstImage && typeof firstImage === 'object') {
		const objectImage = firstImage.src || firstImage.url
		if (objectImage && objectImage.trim()) {
			return normalizeAbsoluteUrl(objectImage, siteUrl)
		}
	}

	const mainImage = getModelMainImagePath(model.slug, model.type === 'columns')
	if (mainImage) {
		return normalizeAbsoluteUrl(mainImage, siteUrl)
	}

	return normalizeAbsoluteUrl(categoryFallbackImages[model.type] || '/images/logo.png', siteUrl)
}

function sanitizeProperties(properties: ModelSpecItem[]): Array<{ '@type': 'PropertyValue'; name: string; value: string }> {
	return properties
		.filter(item => {
			const value = item.value?.trim()
			return Boolean(value && value !== '—' && value !== 'null' && value !== 'undefined')
		})
		.map(item => ({
			'@type': 'PropertyValue',
			name: item.label,
			value: item.value.trim(),
		}))
}

export function buildModelJsonLd(input: BuildModelJsonLdInput): Record<string, unknown> {
	const organizationId = `${input.siteUrl}/#organization`
	const websiteId = `${input.siteUrl}/#website`
	const breadcrumbId = `${input.canonicalUrl}#breadcrumb`
	const productId = `${input.canonicalUrl}#product`
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

	const additionalProperty = sanitizeProperties(input.additionalProperties)

	const baseProduct: Record<string, unknown> = {
		'@type': 'Product',
		'@id': productId,
		name: input.productName,
		url: input.canonicalUrl,
		image: [input.imageUrl],
		description: input.description,
		brand: {
			'@type': 'Brand',
			name: 'Velar',
		},
		category: input.categoryLabel,
		material: getMaterialValue(input.model),
		additionalProperty,
	}

	if (input.parentSeries) {
		const parentSeriesUrl = normalizeAbsoluteUrl(input.parentSeries.url, input.siteUrl)
		baseProduct.isVariantOf = {
			'@type': 'ProductGroup',
			'@id': `${parentSeriesUrl}#product-group`,
			name: input.parentSeries.title,
			productGroupID: input.parentSeries.slug,
		}
	}

	if (input.priceMin && input.priceMin > 0) {
		if ((input.offerCount || 0) > 1) {
			baseProduct.offers = {
				'@type': 'AggregateOffer',
				priceCurrency: 'RUB',
				lowPrice: String(input.priceMin),
				highPrice: input.priceMax && input.priceMax > input.priceMin ? String(input.priceMax) : undefined,
				offerCount: String(input.offerCount),
				availability: input.availabilityUrl,
				url: input.canonicalUrl,
				seller: {
					'@id': organizationId,
				},
			}
		} else {
			baseProduct.offers = {
				'@type': 'Offer',
				url: input.canonicalUrl,
				priceCurrency: 'RUB',
				price: String(input.priceMin),
				availability: input.availabilityUrl,
				itemCondition: 'https://schema.org/NewCondition',
				seller: {
					'@id': organizationId,
				},
			}
		}
	}

	const graph: Record<string, unknown>[] = [
		{
			'@type': 'Organization',
			'@id': organizationId,
			name: 'VelarShop.ru',
			url: `${input.siteUrl}/`,
			logo: `${input.siteUrl}/images/logo.png`,
			telephone: '+7 495 128-85-05',
			areaServed: 'RU',
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
		baseProduct,
	]

	if (input.includeFaq && input.faqItems.length > 0) {
		graph.push({
			'@type': 'FAQPage',
			'@id': faqId,
			mainEntity: input.faqItems.map(item => ({
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

export function getModelSeo(input: ModelSeoInput): ModelSeoResult {
	const siteUrl = input.siteUrl ?? DEFAULT_SITE_URL
	const normalizedModelName = normalizeModelName(input.model.name)
	const modelFullName = `Velar ${normalizedModelName}`
	const modelUrl = getModelSlug(input.model)
	const canonicalUrl = normalizeAbsoluteUrl(modelUrl, siteUrl)
	const orientationLabel = getOrientationLabel(input.model)
	const isDesign = input.model.type === 'design'

	const prices = input.radiators.map(radiator => toNumber(radiator.price)).filter(value => value > 0)
	const priceMin = prices.length ? Math.min(...prices) : undefined
	const priceMax = prices.length ? Math.max(...prices) : undefined
	const profilePhrase = getProfilePhrase(input.model.short_comment)

	const titleSuffix = isDesign
		? `${orientationLabel ? `${orientationLabel} ` : ''}дизайн-радиатор Velar`
		: `${input.model.prefix.toLowerCase()} Velar`
	const title = `${modelFullName} купить | ${titleSuffix}`

	const description = buildModelDescription({
		modelFullName,
		orientationLabel,
		isDesign,
		prefix: input.model.prefix,
		profilePhrase,
	})

	const ogTitle = isDesign
		? `${modelFullName} — ${orientationLabel || 'дизайн'} дизайн-радиатор Velar`
		: `${modelFullName} — ${input.model.prefix.toLowerCase()} Velar`
	const ogDescription = getOgDescription({
		priceMin,
		orientationLabel,
		profilePhrase,
	})
	const ogImage = resolveModelImage(input.model, siteUrl)
	const ogImageAlt = `${modelFullName} — дизайн-радиатор Velar`

	const hasHiddenFlag = Boolean((input.model as unknown as { hidden?: boolean; noindex?: boolean }).hidden)
	const hasNoindexFlag = Boolean((input.model as unknown as { hidden?: boolean; noindex?: boolean }).noindex)
	const hasValidDescription = Boolean((input.heroDescription || input.model.short_comment || '').trim())
	const robots = hasHiddenFlag || hasNoindexFlag || (!hasValidDescription && !priceMin) ? 'noindex, follow' : 'index, follow'

	const productMeta = {
		brand: 'Velar',
		availability: 'preorder',
		condition: 'new',
		priceAmount: priceMin ? String(priceMin) : undefined,
		priceCurrency: priceMin ? 'RUB' : undefined,
	}

		const jsonLd = buildModelJsonLd({
			siteUrl,
			canonicalUrl,
			model: input.model,
			productName: modelFullName,
			description: input.heroDescription || description,
		categoryLabel: input.categoryLabel,
		breadcrumbs: input.breadcrumbs,
		imageUrl: ogImage,
		priceMin,
		priceMax,
			offerCount: input.radiators.length,
			availabilityUrl: 'https://schema.org/PreOrder',
			additionalProperties: input.additionalProperties,
			parentSeries: input.parentSeries,
			faqItems: input.faqItems,
			includeFaq: input.faqItems.length > 0,
		})

	return {
		title,
		description,
		canonicalUrl,
		ogTitle,
		ogDescription,
		ogImage,
		ogImageAlt,
		twitterTitle: ogTitle,
		twitterDescription: ogDescription,
		twitterImage: ogImage,
		twitterImageAlt: ogImageAlt,
		robots,
		productMeta,
		jsonLd,
		priceMin,
		priceMax,
	}
}
