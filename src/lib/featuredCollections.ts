import { modelsJsonData } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import {
	catalogCollections,
	collectionMatchesModel,
	collectionMatchesRadiator,
	type CatalogCollectionConfig,
} from './catalogCollections'

export type FeaturedCollection = {
	slug: string
	href: string
	title: string
	shortTitle: string
	description: string
	image: string
	imageAlt: string
	facts: string[]
}

export type CollectionGroup = {
	id: 'height' | 'interaxial' | 'tubular' | 'convector'
	title: string
	description: string
	href?: string
	linkLabel?: string
	items: FeaturedCollection[]
}

function collectionFacts(collection: CatalogCollectionConfig): string[] {
	const models = modelsJsonData.filter(model =>
		collectionMatchesModel(collection, model) && radiatorsJsonData.some(
			radiator => radiator.model_id === model.id && collectionMatchesRadiator(collection, model, radiator),
		),
	)
	const modelById = new Map(models.map(model => [model.id, model]))
	const variants = radiatorsJsonData.filter(radiator => {
		const model = modelById.get(radiator.model_id)
		return model ? collectionMatchesRadiator(collection, model, radiator) : false
	})

	return [`${models.length} моделей`, `${variants.length} конфигураций`]
}

function toFeatured(collection: CatalogCollectionConfig): FeaturedCollection {
	return {
		slug: collection.slug,
		href: collection.href,
		title: collection.title,
		shortTitle: collection.shortTitle,
		description: collection.intro,
		image: collection.image,
		imageAlt: collection.imageAlt,
		facts: collectionFacts(collection),
	}
}

const vertical1800Collection: FeaturedCollection = {
	slug: 'verticalnye-radiatory-1800-mm',
	href: '/collections/verticalnye-radiatory-1800-mm',
	title: 'Вертикальные радиаторы 1800 мм',
	shortTitle: 'Высота 1800 мм',
	description: 'Высокие трубчатые и профильные радиаторы около 180 см для узких стен, простенков, гостиных, прихожих и современных интерьеров.',
	image: '/images/models/p30v/main.jpg',
	imageAlt: 'Вертикальный радиатор Velar высотой около 1800 мм',
	facts: ['18 моделей', 'высота около 180 см'],
}

const interaxialItems = catalogCollections.filter(item => item.siblingGroup === 'interaxial').map(toFeatured)
const exactHeightItems = catalogCollections.filter(item => item.siblingGroup === 'height').map(toFeatured)
const heightItems = [...exactHeightItems, vertical1800Collection].sort((a, b) => {
	const aHeight = Number(a.shortTitle.match(/\d+/)?.[0] ?? 0)
	const bHeight = Number(b.shortTitle.match(/\d+/)?.[0] ?? 0)
	return aHeight - bHeight
})
const tubularItems = catalogCollections.filter(item => item.siblingGroup === 'tubular').map(toFeatured)
const convectorItems = catalogCollections.filter(item => item.siblingGroup === 'convector').map(toFeatured)

export const collectionGroups: CollectionGroup[] = [
	{
		id: 'interaxial',
		title: 'По межосевому расстоянию',
		description: 'Подборки для готовых выводов труб. Межосевое расстояние измеряется между центрами подключения и не равно полной высоте радиатора.',
		href: '/collections/radiatory-po-mezhosevomu-rasstoyaniyu',
		linkLabel: 'Как выбрать по межосевому расстоянию',
		items: interaxialItems,
	},
	{
		id: 'height',
		title: 'По полной высоте',
		description: 'Точные размеры для низких зон под окном, стандартных ниш и свободных вертикальных участков стены. Высота здесь означает размер корпуса, а не межосевое расстояние.',
		items: heightItems,
	},
	{
		id: 'tubular',
		title: 'Трубчатые радиаторы',
		description: 'Коммерческие подборки трубчатых радиаторов по числу рядов труб и высоте установки. Чем больше труб, тем обычно больше глубина и мощность секции.',
		href: '/columns',
		linkLabel: 'Все трубчатые радиаторы',
		items: tubularItems,
	},
	{
		id: 'convector',
		title: 'Внутрипольные конвекторы',
		description: 'Выбор между тихой естественной конвекцией и моделями с вентиляторами для повышенной теплоотдачи у панорамных окон.',
		href: '/convector',
		linkLabel: 'Все внутрипольные конвекторы',
		items: convectorItems,
	},
]

export const featuredCollections = collectionGroups.flatMap(group => group.items)

export const footerCollectionLinks = [
	{ href: '/collections', label: 'Все подборки' },
	{ href: '/collections/radiatory-mezhosevoe-rasstoyanie-500-mm', label: 'Межосевое 500 мм' },
	{ href: '/collections/radiatory-vysotoy-500-mm', label: 'Высота 500 мм' },
	{ href: '/collections/verticalnye-radiatory-1800-mm', label: 'Вертикальные 1800 мм' },
	{ href: '/collections/nizkie-trubchatye-radiatory', label: 'Низкие трубчатые' },
	{ href: '/collections/vnutripolnye-konvektory-s-ventilyatorom', label: 'Конвекторы с вентилятором' },
] as const
