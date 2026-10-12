import { modelsJsonData } from '@entities/Model'
import { radiatorsJsonData } from '@entities/Radiator'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { catalogNumber } from './catalogFacts'

export type ExampleSpec = { modelId: string; height?: number; length?: number; sections?: number }

export function catalogExamples(specs: ExampleSpec[]) {
	return specs.flatMap(spec => {
		const model = modelsJsonData.find(item => item.id === spec.modelId)
		if (!model) throw new Error(`Не найдена модель примера: ${spec.modelId}`)
		const candidates = radiatorsJsonData.filter(item => item.model_id === model.id
			&& (!spec.height || catalogNumber(item.height) === spec.height)
			&& (!spec.length || catalogNumber(item.length) === spec.length)
			&& (!spec.sections || catalogNumber(item.sections) === spec.sections))
		const radiator = candidates.sort((a, b) => catalogNumber(a.price) - catalogNumber(b.price))[0]
		if (!radiator) throw new Error(`Не найдена конфигурация примера: ${JSON.stringify(spec)}`)
		const price = catalogNumber(radiator.price)
		const grillePrice = model.type === 'convector' ? catalogNumber(radiator.basiс_grille_price) : 0
		return [{ model, radiator, href: getModelSlug(model), price, grillePrice, total: price + grillePrice }]
	})
}

export const tubeComparisonSpecs: ExampleSpec[] = [2, 3, 4, 5].map(count => ({ modelId: `${count}057`, sections: 10 }))
export const verticalExampleSpecs: ExampleSpec[] = ['p30v', 'q40v', 'r32v'].map(modelId => ({ modelId, height: 1750, sections: 10 }))
export const panoramaExampleSpecs: ExampleSpec[] = ['p200', 'p300', 'kwh', 'kwhv', 'kwhv24'].map(modelId => ({ modelId, length: 1500 }))
