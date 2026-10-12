import { catalogExamples } from './catalogExamples'
import { catalogNumber } from './catalogFacts'
import { powerAtDeltaT } from './thermalPower'

export const comparisonRoom = { height: 1750, heatLoad: 1500, deltaT: 70 } as const

// Keep each rendered configuration aligned with its illustration and mounting drawing.
const illustratedModels = [
	{ modelId: 'p30v', sections: 6, length: 284, projection: 90, exponent: 1.30, image: 'velar-p30v-6-same-room-v2.webp' },
	{ modelId: 'q40v', sections: 8, length: 460, projection: 70, exponent: 1.30, image: 'velar-q40v-8-same-room-v2.webp' },
	{ modelId: 'r32v', sections: 9, length: 432, projection: 61, exponent: 1.30, image: 'velar-r32v-9-same-room-v3.webp' },
] as const

export function roomRadiatorComparison() {
	return illustratedModels.map(spec => {
		const row = catalogExamples([{ modelId: spec.modelId, height: comparisonRoom.height, sections: spec.sections }])[0]
		const power = catalogNumber(row.radiator.dt70)
		if (catalogNumber(row.radiator.length) !== spec.length || catalogNumber(row.radiator.width) !== spec.projection || power < comparisonRoom.heatLoad) {
			throw new Error(`Сверьте иллюстрацию, монтажную схему и тепловую задачу для ${spec.modelId}`)
		}
		return { ...row, ...spec, power, powerAt50: Math.round(powerAtDeltaT(50, power, spec.exponent)) }
	})
}
