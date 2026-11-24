// Круглые образцы цвета вместо текстового списка. Значения те же id, что и в select (designColorId, columnColorId и т.д.).
// Для одиночных RAL - приближение sRGB; для «По шкале RAL», металликов и лаков - нейтральный узор без выдуманного цвета.

type SwatchOption = {
	id: string
	/** Полная подпись с наценкой, например «По шкале RAL (+20%)». */
	label: string
}

type Props = {
	options: SwatchOption[]
	selected: string
	onChange: (id: string) => void
	/** id элемента с подписью группы (aria-labelledby). */
	labelledBy?: string
	/** compact - для карточки быстрого подбора: кнопка 32 px, кружок 20 px. */
	compact?: boolean
}

const RAL_9016 = '#F1F0EA'
const RAL_9005 = '#0E0E10'

// Глянец отличается от матового только легким бликом.
const GLOSS_LIGHT = 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 46%)'
const GLOSS_DARK = 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 46%)'
// Нейтральные узоры: не изображают конкретный оттенок.
const ANY_RAL = 'conic-gradient(#d9534f, #e6b422, #5cb85c, #3a87ad, #8e6bbf, #d9534f)'
const METALLIC = 'linear-gradient(135deg, #f5f5f5 0%, #a3a3a3 30%, #e5e5e5 52%, #8a8a8a 76%, #d4d4d4 100%)'
const LACQUER = 'repeating-linear-gradient(45deg, #e5e5e5 0px, #e5e5e5 3px, #a3a3a3 3px, #a3a3a3 6px)'

const swatchBackgrounds: Record<string, string> = {
	ral_9016_gloss: `${GLOSS_LIGHT}, ${RAL_9016}`,
	ral_9016_matte: RAL_9016,
	ral_9005_gloss: `${GLOSS_DARK}, ${RAL_9005}`,
	ral_9005_matte: RAL_9005,
	ral_any: ANY_RAL,
	metallic: METALLIC,
	bronze: METALLIC,
	gold: METALLIC,
	old_gold: METALLIC,
	lak_copper: LACQUER,
	lak_bronze: LACQUER,
	lak_tl: LACQUER,
	lak_lat: LACQUER,
}

/** Есть ли образцы для всех вариантов списка (иначе остается текстовый список). */
export function hasColorSwatches(ids: string[]): boolean {
	return ids.length > 0 && ids.every(id => id in swatchBackgrounds)
}

function ColorSwatches({ options, selected, onChange, labelledBy, compact = false }: Props) {
	const selectedOption = options.find(option => option.id === selected)
	const buttonSize = compact ? 'h-8 w-8' : 'h-9 w-9'
	const dotSize = compact ? 'h-5 w-5' : 'h-6 w-6'

	return (
		<div>
			<div
				role='radiogroup'
				aria-labelledby={labelledBy}
				class='mt-1 flex flex-wrap gap-0.5'
			>
				{options.map(option => {
					const isSelected = option.id === selected
					return (
						<button
							type='button'
							role='radio'
							aria-checked={isSelected}
							aria-label={option.label}
							title={option.label}
							class={`inline-flex ${buttonSize} shrink-0 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-red-300`}
							onClick={() => onChange(option.id)}
						>
							<span
								aria-hidden='true'
								class={`block ${dotSize} rounded-full border border-[#d4d4d4]`}
								style={{
									background: swatchBackgrounds[option.id] ?? LACQUER,
									boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 4px #171717' : undefined,
								}}
							/>
						</button>
					)
				})}
			</div>
			<div class='mt-0.5 min-h-[1rem] text-xs font-normal leading-4 text-neutral-700'>{selectedOption?.label ?? ''}</div>
		</div>
	)
}

export default ColorSwatches
