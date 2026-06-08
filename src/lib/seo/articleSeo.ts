type ArticleSeoInput = {
	title: string
	description: string
	canonicalUrl: string
	imageUrl?: string
	datePublished?: string
	dateModified?: string
}

function isValidIsoDate(value?: string): boolean {
	if (!value) return false
	return !Number.isNaN(Date.parse(value))
}

export function buildArticleJsonLd(input: ArticleSeoInput): Record<string, unknown> {
	const jsonLd: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: input.title,
		description: input.description,
		mainEntityOfPage: input.canonicalUrl,
		url: input.canonicalUrl,
		author: {
			'@type': 'Organization',
			name: 'VelarShop',
		},
		publisher: {
			'@type': 'Organization',
			name: 'VelarShop',
		},
		inLanguage: 'ru-RU',
	}

	if (input.imageUrl) jsonLd.image = [input.imageUrl]
	if (isValidIsoDate(input.datePublished)) jsonLd.datePublished = input.datePublished
	if (isValidIsoDate(input.dateModified)) jsonLd.dateModified = input.dateModified

	return jsonLd
}
