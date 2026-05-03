import type { ColumnsModelCard } from '../../components/columns/columnsData'

const SITE_URL = 'https://velarshop.ru'

type FaqItem = {
	question: string
	answer: string
}

function absoluteUrl(pathOrUrl: string): string {
	return new URL(pathOrUrl, SITE_URL).toString()
}

function formatModelName(model: ColumnsModelCard): string {
	return `Трубчатый радиатор Velar ${model.name}`
}

function buildModelDescription(model: ColumnsModelCard): string {
	const placement = model.height <= 700 ? 'под окно' : 'для жилых и коммерческих помещений'
	return `${model.tubeCount}-трубчатый стальной радиатор высотой ${model.height} мм, ${placement}.`
}

export function buildColumnsCollectionPageSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': `${SITE_URL}/columns/#webpage`,
		url: `${SITE_URL}/columns/`,
		name: 'Трубчатые радиаторы Velar',
		description:
			'Стальные трубчатые радиаторы Velar для квартир, домов и интерьеров. Разные высоты, цвета RAL, производство под заказ, доставка по России.',
		isPartOf: {
			'@type': 'WebSite',
			'@id': `${SITE_URL}/#website`,
			url: `${SITE_URL}/`,
			name: 'VelarShop.ru',
		},
		about: {
			'@type': 'Thing',
			name: 'Трубчатые радиаторы отопления',
		},
	}
}

export function buildColumnsItemListSchema(models: ColumnsModelCard[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'@id': `${SITE_URL}/columns/#itemlist`,
		name: 'Модели трубчатых радиаторов Velar',
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		numberOfItems: models.length,
		itemListElement: models.map((model, index) => {
			const modelUrl = absoluteUrl(model.href)
			return {
				'@type': 'ListItem',
				position: index + 1,
				url: modelUrl,
				item: {
					'@type': 'Product',
					'@id': `${modelUrl}#product`,
					name: formatModelName(model),
					url: modelUrl,
					image: absoluteUrl(model.image),
					description: buildModelDescription(model),
					brand: {
						'@type': 'Brand',
						name: 'Velar',
					},
					offers: {
						'@type': 'Offer',
						price: String(model.minPrice),
						priceCurrency: 'RUB',
						url: modelUrl,
					},
				},
			}
		}),
	}
}

export function buildColumnsFaqSchema(faqItems: FaqItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': `${SITE_URL}/columns/#faq`,
		mainEntity: faqItems.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
	}
}

export function buildColumnsHowToSchema(steps: string[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		'@id': `${SITE_URL}/columns/#howto-order`,
		name: 'Как заказать трубчатые радиаторы Velar',
		description:
			'Порядок заказа трубчатых радиаторов Velar: выбор модели, указание параметров, расчет стоимости, производство и доставка.',
		step: steps.map((step, index) => ({
			'@type': 'HowToStep',
			position: index + 1,
			name: step,
			text: step,
		})),
	}
}
