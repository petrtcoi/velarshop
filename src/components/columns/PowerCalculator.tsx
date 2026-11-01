import { addToCart, storeShoppingCart } from '@features/order/ShoppingCart'
import { useStore } from '@nanostores/preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

export type PowerSelectorModel = {
	id: string
	name: string
	tubes: number
	height: number
	depth: number
	sectionLength: number
	// dt70 на секцию в целых сотых ватта: сравнения с потребностью идут без погрешности number
	dt70Hundredths: number
	maxSections: number
	pricePerSection: number
	href: string
	source: 'passport' | 'catalog'
}

export type PowerSelectorColor = {
	id: string
	label: string
	multiplicate: number
}

export type PowerSelectorConnection = {
	id: string
	label: string
	priceRub: number
}

type RoomEstimate = { area10: number; ceiling10: number; corner: boolean }

// Источник требуемых ватт: ручной ввод (основной режим) или приблизительная оценка по помещению (T05B)
type DemandOrigin = { source: 'manual' } | { source: 'room'; room: RoomEstimate }

type Candidate = {
	model: PowerSelectorModel
	sections: number
	powerHundredths: number
	length: number
	price: number
	demandHundredths: number
	origin: DemandOrigin
}

const MIN_SECTIONS = 4
const MAX_RESULTS = 5
const CART_HREF = '/cart'
const REQUEST_HREF = '/request'
const DEMAND_WARNING =
	'Подбор рассчитан для системы 95/85/20. Если у вас другой температурный режим или он неизвестен, радиатор может не покрыть теплопотери — уточните выбор у проектировщика/менеджера.'
const INFO_TEXT =
	'Это приблизительная оценка по площади, высоте и расположению комнаты. Она не учитывает утепление, окна, вентиляцию, параметры системы отопления и особенности дома. Надёжнее взять проектную мощность в управляющей компании или узнать характеристики установленных застройщиком радиаторов и сравнить их при одинаковом температурном режиме. Перед заказом мощность и подключение подтвердит специалист.'

// Площадь 2–40 м² и потолок 2,2–5,0 м хранятся в десятых долях: 16,5 м² → 165
const AREA_MIN_TENTHS = 20
const AREA_MAX_TENTHS = 400
const CEILING_MIN_TENTHS = 22
const CEILING_MAX_TENTHS = 50
const DEFAULT_AREA_INPUT = '16'
const DEFAULT_CEILING_INPUT = '2,8'
const DEFAULT_COLOR_ID = 'ral_9016_gloss'
const DEFAULT_CONNECTION_ID = 'lat1/2'
// id из columnConnections.ts — «Нижнее по центру 50 мм (только для 3-трубчатых)»;
// в записи первая и последняя буквы идентификатора кириллические
const CENTER_50_CONNECTION_ID = 'с50с'
// Цвет «По шкале RAL»: множитель 1,2, оттенок известен только после указания кода
const ANY_RAL_COLOR_ID = 'ral_any'

const AREA_INPUT_RE = /^\d{1,2}(\.\d)?$/
const CEILING_INPUT_RE = /^\d(\.\d)?$/

// Требуемая мощность хранится в целых сотых ватта: ввод допускает 2 знака после запятой,
// и эта точность доходит до сравнения с секциями и до заявки без округления
function parseDemandHundredths(raw: string): number | null {
	const normalized = raw.trim().replace(/\s/g, '').replace(',', '.')
	if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalized)) return null
	const [whole, frac = ''] = normalized.split('.')
	const hundredths = Number.parseInt(`${whole}${frac.padEnd(2, '0')}`, 10)
	return hundredths > 0 ? hundredths : null
}

function parseLimit(raw: string): number | null {
	const normalized = raw.trim().replace(/\s/g, '')
	if (normalized === '') return null
	if (!/^\d{1,5}$/.test(normalized)) return null
	const value = Number.parseInt(normalized, 10)
	return value > 0 ? value : null
}

// Ввод «16», «16,5» → десятые доли (160, 165); формат — не больше одного знака после запятой
export function parseTenths(raw: string, pattern: RegExp): number | null {
	const normalized = raw.trim().replace(/\s/g, '').replace(',', '.')
	if (!pattern.test(normalized)) return null
	return Math.round(Number.parseFloat(normalized) * 10)
}

// Сотые ватта → «1500», «1500,5», «1500,05»: точность ввода не искажается.
// Без группировки разрядов — формат совпадает с позицией заявки («требуется 1500,05 Вт»)
function fmtWatts(hundredths: number): string {
	const whole = Math.floor(hundredths / 100)
	const frac = hundredths % 100
	if (frac === 0) return String(whole)
	return `${whole},${String(frac).padStart(2, '0').replace(/0$/, '')}`
}

// Десятые доли → «16», «16,5», «2,8»: как в вводе и в названии позиции заявки
export function fmtTenths(tenths: number): string {
	const whole = Math.floor(tenths / 10)
	const frac = tenths % 10
	return frac === 0 ? String(whole) : `${whole},${frac}`
}

function fmtRub(value: number): string {
	return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

function pluralSections(count: number): string {
	const mod100 = count % 100
	const mod10 = count % 10
	if (mod100 >= 11 && mod100 <= 14) return 'секций'
	if (mod10 === 1) return 'секция'
	if (mod10 >= 2 && mod10 <= 4) return 'секции'
	return 'секций'
}

// Владелец (T05B): потолок до 3,0 м включительно — 100 Вт/м², выше — 40 Вт/м³; угловая комната ×1,25
// (рабочее допущение мастера из диапазона 1,2–1,3, не норматив). Вход в десятых долях, арифметика
// целочисленная — ceil без float-хвостов (12,3 × 100 Вт → 1230 Вт, а не 1231).
// baseTenths — это baseW × 10; итог = ceil(baseW × (corner ? 1,25 : 1))
export function estimateWatts(area10: number, ceiling10: number, corner: boolean): number {
	const baseTenths = ceiling10 <= 30 ? area10 * 100 : area10 * ceiling10 * 4
	return Math.ceil((baseTenths * (corner ? 5 : 4)) / 40)
}

// «по какой ветке посчитано»: 16 м² × 100 Вт/м² (…) либо 16 м² × 3,1 м × 40 Вт/м³ (…), угловая — × 1,25
export function estimateBranchText(room: RoomEstimate): string {
	const base =
		room.ceiling10 <= 30
			? `${fmtTenths(room.area10)} м² × 100 Вт/м² (высота потолка ${fmtTenths(room.ceiling10)} м — до 3,0 м)`
			: `${fmtTenths(room.area10)} м² × ${fmtTenths(room.ceiling10)} м × 40 Вт/м³ (высота потолка выше 3,0 м)`
	return room.corner ? `${base} × 1,25 (угловая комната)` : base
}

// Происхождение ватт в названии позиции: ручной ввод — «требуется», оценка — «примерная потребность
// по помещению» с площадью, потолком и признаком угловой комнаты (письма details не передают)
export function demandTitlePart(origin: DemandOrigin, demandHundredths: number): string {
	if (origin.source === 'manual') return `требуется ${fmtWatts(demandHundredths)} Вт`
	const { area10, ceiling10, corner } = origin.room
	return `примерная потребность по помещению (${fmtTenths(area10)} м², потолок ${fmtTenths(ceiling10)} м, ${corner ? '' : 'не '}угловая): ${fmtWatts(demandHundredths)} Вт`
}

// «свой RAL» нельзя выдавать за выбранный точный цвет: код либо указан, либо в заявке помечено согласование
export function colorTitlePart(color: PowerSelectorColor, ralCode: string): string {
	if (color.id === ANY_RAL_COLOR_ID) {
		const code = ralCode.trim()
		return code ? `цвет: по шкале RAL ${code}` : 'цвет: по шкале RAL — код согласовать'
	}
	return `цвет: ${color.label}`
}

function connectionTitlePart(connection: PowerSelectorConnection): string {
	return `подключение: ${connection.label}`
}

export function getCartTitle(
	candidate: Candidate,
	color: PowerSelectorColor,
	connection: PowerSelectorConnection,
	ralCode: string,
): string {
	const { model, sections, powerHundredths, length } = candidate
	return [
		`Velar ${model.id}, ${sections} ${pluralSections(sections)}`,
		demandTitlePart(candidate.origin, candidate.demandHundredths),
		`${fmtWatts(powerHundredths)} Вт при ΔT70 (95/85/20)`,
		`${length}×${model.depth}×${model.height} мм`,
		colorTitlePart(color, ralCode),
		connectionTitlePart(connection),
	].join('; ')
}

export function getCartDetails(
	candidate: Candidate,
	color: PowerSelectorColor,
	connection: PowerSelectorConnection,
	ralCode: string,
): string {
	const { model, powerHundredths, length } = candidate
	return [
		`${length}×${model.depth}×${model.height} мм`,
		`${fmtWatts(powerHundredths)} Вт при ΔT70 (95/85/20)`,
		demandTitlePart(candidate.origin, candidate.demandHundredths),
		colorTitlePart(color, ralCode),
		connectionTitlePart(connection),
	].join(' / ')
}

// Как в действующем конфигураторе (HeroQuickConfigurator.getTotalPrice):
// итог = Math.round(цена прибора × множитель цвета + доплата за подключение)
export function getFinalPrice(basePrice: number, color: PowerSelectorColor, connection: PowerSelectorConnection): number {
	return Math.max(0, Math.round(basePrice * color.multiplicate + connection.priceRub))
}

function colorOptionLabel(color: PowerSelectorColor): string {
	const percent = Math.round((color.multiplicate - 1) * 100)
	return percent > 0 ? `${color.label} (+${percent}%)` : color.label
}

function connectionOptionLabel(connection: PowerSelectorConnection): string {
	return connection.priceRub > 0 ? `${connection.label} (+${fmtRub(connection.priceRub)})` : connection.label
}

function sourceLabel(source: PowerSelectorModel['source']): string {
	return source === 'passport' ? 'сверено с паспортом' : 'по данным каталога при ΔT70'
}

function fieldLabelClass(): string {
	return 'mb-0.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-600'
}

function fieldClass(hasError: boolean): string {
	return `h-9 w-full min-w-0 rounded-lg border bg-neutral-50 px-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:ring-2 md:h-10 ${
		hasError ? 'border-[#b91c1c] ring-red-100' : 'border-neutral-200 hover:border-neutral-300 focus:border-red-500 focus:ring-red-100'
	}`
}

function stepButtonClass(): string {
	return 'h-9 w-9 shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 text-base leading-none text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950 md:h-10'
}

export default function PowerCalculator({
	models,
	colors,
	connections,
}: {
	models: PowerSelectorModel[]
	colors: PowerSelectorColor[]
	connections: PowerSelectorConnection[]
}) {
	const shoppingCart = useStore(storeShoppingCart)
	const [demandInput, setDemandInput] = useState('')
	const [estimateMode, setEstimateMode] = useState(false)
	const [areaInput, setAreaInput] = useState('')
	const [ceilingInput, setCeilingInput] = useState('')
	const [corner, setCorner] = useState(false)
	const [heightLimit, setHeightLimit] = useState('')
	const [lengthInput, setLengthInput] = useState('')
	const [tubesInput, setTubesInput] = useState('')
	const [touched, setTouched] = useState(false)
	const [results, setResults] = useState<Candidate[] | null>(null)
	const [searched, setSearched] = useState<{ demandHundredths: number; origin: DemandOrigin } | null>(null)
	const [infoOpen, setInfoOpen] = useState(false)
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const [colorId, setColorId] = useState(DEFAULT_COLOR_ID)
	const [connectionId, setConnectionId] = useState(DEFAULT_CONNECTION_ID)
	const [ralCode, setRalCode] = useState('')
	const infoRef = useRef<HTMLDivElement>(null)

	// Попап «i»: закрытие по Escape и по касанию/клику вне
	useEffect(() => {
		if (!infoOpen) return
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setInfoOpen(false)
		}
		const handlePointerDown = (event: PointerEvent) => {
			if (!infoRef.current?.contains(event.target as Node)) setInfoOpen(false)
		}
		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('pointerdown', handlePointerDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [infoOpen])

	// Любое изменение входа (включая смену источника мощности и опций результата) скрывает прошлый
	// результат: иначе в заявку можно добавить конфигурацию, подобранную под старый ввод
	const clearResults = () => {
		setResults(null)
		setSearched(null)
		setExpandedId(null)
	}

	const heightOptions = useMemo(() => [...new Set(models.map(model => model.height))].sort((a, b) => a - b), [models])

	const demand = parseDemandHundredths(demandInput)
	const area10 = parseTenths(areaInput, AREA_INPUT_RE)
	const ceiling10 = parseTenths(ceilingInput, CEILING_INPUT_RE)
	const lengthLimit = parseLimit(lengthInput)

	const areaValid = area10 !== null && area10 >= AREA_MIN_TENTHS && area10 <= AREA_MAX_TENTHS
	const ceilingValid = ceiling10 !== null && ceiling10 >= CEILING_MIN_TENTHS && ceiling10 <= CEILING_MAX_TENTHS
	const estimateValid = areaValid && ceilingValid

	const demandError = demand === null ? 'Введите мощность — положительное число в ваттах, например 1500' : ''
	const areaError = 'Площадь — число от 2 до 40 м², не более одного знака после запятой'
	const ceilingError = 'Высота потолка — число от 2,2 до 5,0 м, не более одного знака после запятой'
	const lengthError = lengthLimit === null && lengthInput.trim() !== '' ? 'Длина — целое число в миллиметрах' : ''
	const hasErrors = estimateMode ? !estimateValid || lengthError !== '' : demand === null || lengthError !== ''

	// Высоту помещения (м) не смешивать с ограничением по высоте радиатора (мм) — подписи разные
	const switchToEstimateMode = () => {
		setEstimateMode(true)
		setDemandInput('')
		setAreaInput(DEFAULT_AREA_INPUT)
		setCeilingInput(DEFAULT_CEILING_INPUT)
		setCorner(false)
		setTouched(false)
		setInfoOpen(false)
		clearResults()
	}
	const switchToManualMode = () => {
		setEstimateMode(false)
		setDemandInput('')
		setAreaInput('')
		setCeilingInput('')
		setCorner(false)
		setTouched(false)
		setInfoOpen(false)
		clearResults()
	}

	// Кнопки ± не выходят за границы; при недопустимом вводе возвращают значение по умолчанию
	const stepArea = (direction: 1 | -1) => {
		const current = areaValid ? area10 : 160
		setAreaInput(fmtTenths(Math.min(AREA_MAX_TENTHS, Math.max(AREA_MIN_TENTHS, current + direction * 10))))
		clearResults()
	}
	const stepCeiling = (direction: 1 | -1) => {
		const current = ceilingValid ? ceiling10 : 28
		setCeilingInput(fmtTenths(Math.min(CEILING_MAX_TENTHS, Math.max(CEILING_MIN_TENTHS, current + direction))))
		clearResults()
	}

	// «только для 3-трубчатых» у нижнего по центру — из описания в columnConnections.ts
	const connectionsFor = (tubes: number) =>
		connections.filter(connection => connection.id !== CENTER_50_CONNECTION_ID || tubes === 3)

	const runSearch = () => {
		if (hasErrors) return
		const heightLimitValue = heightLimit === '' ? null : Number.parseInt(heightLimit, 10)
		const tubesValue = tubesInput === '' ? null : Number.parseInt(tubesInput, 10)

		let demandHundredths: number
		let origin: DemandOrigin
		if (estimateMode) {
			const room: RoomEstimate = { area10: area10 as number, ceiling10: ceiling10 as number, corner }
			demandHundredths = estimateWatts(room.area10, room.ceiling10, room.corner) * 100
			origin = { source: 'room', room }
		} else {
			demandHundredths = demand as number
			origin = { source: 'manual' }
		}

		const found = models
			.filter(model => tubesValue === null || model.tubes === tubesValue)
			.filter(model => heightLimitValue === null || model.height <= heightLimitValue)
			.map<Candidate | null>(model => {
				// ceil в целых сотых ватта: на границе погрешность number не меняет число секций
				// (296,8 Вт / 42,4 Вт = 7 секций, а не 8; 8031,6 / 174,6 = 46, а не 47)
				const q = model.dt70Hundredths
				const sections = Math.floor((demandHundredths + q - 1) / q)
				if (sections < MIN_SECTIONS || sections > model.maxSections) return null
				const length = model.sectionLength * sections
				if (lengthLimit !== null && length > lengthLimit) return null
				return {
					model,
					sections,
					powerHundredths: q * sections,
					length,
					price: model.pricePerSection * sections,
					demandHundredths,
					origin,
				}
			})
			.filter((candidate): candidate is Candidate => candidate !== null)
			.sort((a, b) => {
				const groupA = a.model.tubes <= 3 ? 0 : 1
				const groupB = b.model.tubes <= 3 ? 0 : 1
				if (groupA !== groupB) return groupA - groupB
				if (a.price !== b.price) return a.price - b.price
				return a.model.id.localeCompare(b.model.id, 'ru', { numeric: true })
			})

		setSearched({ demandHundredths, origin })
		setResults(found.slice(0, MAX_RESULTS))
	}

	// Опции хранятся одни на все строки: настроив цвет один раз, можно добавить несколько моделей
	// в одном исполнении. Если выбранное подключение недоступно у новой модели — возврат к базовому
	const toggleOptions = (model: PowerSelectorModel) => {
		if (expandedId === model.id) {
			setExpandedId(null)
			return
		}
		const available = connectionsFor(model.tubes)
		if (!available.some(connection => connection.id === connectionId)) {
			setConnectionId(available[0]?.id ?? '')
		}
		setExpandedId(model.id)
	}

	const minSectionPower = Math.min(...models.map(model => model.dt70Hundredths))
	const smallestModel = models.find(model => model.dt70Hundredths === minSectionPower)
	const maxAppliance = models.reduce(
		(best, model) => (model.dt70Hundredths * model.maxSections > best.power ? { model, power: model.dt70Hundredths * model.maxSections } : best),
		{ model: models[0], power: 0 },
	)

	const emptyState = useMemo(() => {
		if (!results || results.length > 0 || !searched) return null
		const searchedDemand = searched.demandHundredths
		if (searchedDemand > maxAppliance.power) {
			return {
				title: 'Единый прибор такой мощности отсутствует',
				text: `Максимум единого прибора — Velar ${maxAppliance.model.id}, ${maxAppliance.model.maxSections} ${pluralSections(maxAppliance.model.maxSections)}, ${fmtWatts(maxAppliance.power)} Вт при ΔT70 (95/85/20). Несколько приборов в одном расчёте не поддерживается — уточните решение у менеджера.`,
			}
		}
		// N_need < 4 у всех моделей ⇔ W ≤ 3 × q_min (99,6 Вт при q_min = 33,2 Вт у 3020)
		if (smallestModel && searchedDemand <= 3 * minSectionPower) {
			return {
				title: 'Требуемая мощность ниже самого малого прибора',
				text: `Минимальное продаваемое исполнение — Velar ${smallestModel.id}, ${MIN_SECTIONS} ${pluralSections(MIN_SECTIONS)}, ${fmtWatts(MIN_SECTIONS * minSectionPower)} Вт при ΔT70 (95/85/20).`,
			}
		}
		return {
			title: 'Подходящих конфигураций нет',
			text: 'Измените ограничения по высоте, длине или числу трубок — либо запросите расчёт у менеджера.',
		}
	}, [results, searched, maxAppliance, minSectionPower, smallestModel])

	const openModel = expandedId === null ? null : models.find(model => model.id === expandedId) ?? null
	const availableConnections = openModel ? connectionsFor(openModel.tubes) : []
	const selectedColor = colors.find(color => color.id === colorId) ?? colors[0]
	const selectedConnection = availableConnections.find(connection => connection.id === connectionId) ?? availableConnections[0]

	return (
		<div class='rounded-[18px] border border-neutral-200 bg-white p-3.5 md:p-5'>
			<div class='grid gap-3 md:grid-cols-2 md:gap-2'>
				<div class='md:col-span-2'>
					{/* Источник мощности: галочка переключает режимы, два источника не действуют одновременно */}
					<div
						class='relative flex flex-wrap items-center gap-x-2 gap-y-1'
						ref={infoRef}
					>
						<label class='flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-950'>
							<input
								id='power-estimate-mode'
								type='checkbox'
								checked={estimateMode}
								onChange={() => (estimateMode ? switchToManualMode() : switchToEstimateMode())}
								class='h-4 w-4 accent-red-700'
							/>
							Приблизительно по параметрам помещения
						</label>
						<button
							id='estimate-info-button'
							type='button'
							aria-expanded={infoOpen}
							aria-controls='estimate-info-popup'
							aria-label='Что учитывает приблизительная оценка и её ограничения'
							onClick={() => setInfoOpen(open => !open)}
							class='flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-[11px] font-semibold leading-none text-neutral-600 transition hover:border-red-300 hover:text-red-700'
						>
							i
						</button>
						{infoOpen && (
							<div
								id='estimate-info-popup'
								role='note'
								class='absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-neutral-200 bg-white p-3 text-[13px] leading-5 text-neutral-700 shadow-[0_18px_55px_rgba(15,23,42,0.22)] md:right-auto md:w-96'
							>
								{INFO_TEXT}
							</div>
						)}
					</div>

					{estimateMode ? (
						<div class='mt-2 grid gap-2 sm:grid-cols-3'>
							<div>
								<label class={fieldLabelClass()} for='power-area-input'>
									Площадь, м²
								</label>
								<div class='flex gap-1'>
									<button
										type='button'
										aria-label='Уменьшить площадь на 1 м²'
										onClick={() => stepArea(-1)}
										class={stepButtonClass()}
									>
										−
									</button>
									<input
										id='power-area-input'
										type='text'
										inputMode='decimal'
										value={areaInput}
										onInput={event => {
											setAreaInput((event.currentTarget as HTMLInputElement).value)
											clearResults()
										}}
										onBlur={() => setTouched(true)}
										aria-invalid={!areaValid ? 'true' : 'false'}
										class={fieldClass(!areaValid && touched)}
									/>
									<button
										type='button'
										aria-label='Увеличить площадь на 1 м²'
										onClick={() => stepArea(1)}
										class={stepButtonClass()}
									>
										+
									</button>
								</div>
								{touched && !areaValid ? <p class='mt-1 text-xs text-[#b91c1c]'>{areaError}</p> : null}
							</div>
							<div>
								<label class={fieldLabelClass()} for='power-ceiling-input'>
									Высота потолка, м
								</label>
								<div class='flex gap-1'>
									<button
										type='button'
										aria-label='Уменьшить высоту потолка на 0,1 м'
										onClick={() => stepCeiling(-1)}
										class={stepButtonClass()}
									>
										−
									</button>
									<input
										id='power-ceiling-input'
										type='text'
										inputMode='decimal'
										value={ceilingInput}
										onInput={event => {
											setCeilingInput((event.currentTarget as HTMLInputElement).value)
											clearResults()
										}}
										onBlur={() => setTouched(true)}
										aria-invalid={!ceilingValid ? 'true' : 'false'}
										class={fieldClass(!ceilingValid && touched)}
									/>
									<button
										type='button'
										aria-label='Увеличить высоту потолка на 0,1 м'
										onClick={() => stepCeiling(1)}
										class={stepButtonClass()}
									>
										+
									</button>
								</div>
								{touched && !ceilingValid ? <p class='mt-1 text-xs text-[#b91c1c]'>{ceilingError}</p> : null}
							</div>
							<div class='flex items-center sm:justify-center'>
								<label class='flex cursor-pointer items-center gap-2 text-sm text-neutral-950' for='power-corner-check'>
									<input
										id='power-corner-check'
										type='checkbox'
										checked={corner}
										onChange={() => {
											setCorner(checked => !checked)
											clearResults()
										}}
										class='h-4 w-4 accent-red-700'
									/>
									Угловая комната
								</label>
							</div>
						</div>
					) : (
						<div class='mt-2'>
							<label class={fieldLabelClass()} for='power-demand-input'>
								Требуемая мощность отопления, Вт
							</label>
							<input
								id='power-demand-input'
								type='text'
								inputMode='decimal'
								value={demandInput}
								onInput={event => {
									setDemandInput((event.currentTarget as HTMLInputElement).value)
									clearResults()
								}}
								onBlur={() => setTouched(true)}
								placeholder='Например, 1500'
								aria-invalid={demandError ? 'true' : 'false'}
								class={`mt-0.5 ${fieldClass(!!demandError && touched)}`}
							/>
							{touched && demandError ? <p class='mt-1 text-xs text-[#b91c1c]'>{demandError}</p> : null}
						</div>
					)}

					{estimateMode && estimateValid && area10 !== null && ceiling10 !== null ? (
						<p
							class='mt-2 rounded-lg bg-neutral-50 px-2.5 py-2 text-[13px] leading-5 text-neutral-800'
							data-testid='estimate-line'
						>
							Примерная потребность:{' '}
							<span class='font-semibold'>{fmtWatts(estimateWatts(area10, ceiling10, corner) * 100)} Вт</span> —{' '}
							{estimateBranchText({ area10, ceiling10, corner })}.
						</p>
					) : null}

					<p class='mt-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-5 text-neutral-700 md:text-[13px]'>
						{DEMAND_WARNING}
					</p>
				</div>

				<div>
					<label class={fieldLabelClass()} for='power-height-select'>
						Макс. высота радиатора, мм
					</label>
					<select
						id='power-height-select'
						value={heightLimit}
						onChange={event => {
							setHeightLimit((event.currentTarget as HTMLSelectElement).value)
							clearResults()
						}}
						class={fieldClass(false)}
					>
						<option value=''>не важно</option>
						{heightOptions.map(height => (
							<option key={height} value={String(height)}>
								{height}
							</option>
						))}
					</select>
				</div>

				<div>
					<label class={fieldLabelClass()} for='power-length-input'>
						Макс. длина, мм (не обязательно)
					</label>
					<input
						id='power-length-input'
						type='text'
						inputMode='numeric'
						value={lengthInput}
						onInput={event => {
							setLengthInput((event.currentTarget as HTMLInputElement).value)
							clearResults()
						}}
						onBlur={() => setTouched(true)}
						placeholder='Например, 1000'
						aria-invalid={lengthError ? 'true' : 'false'}
						class={`mt-0.5 ${fieldClass(!!lengthError)}`}
					/>
					{lengthError ? <p class='mt-1 text-xs text-[#b91c1c]'>{lengthError}</p> : null}
				</div>

				<div>
					<label class={fieldLabelClass()} for='power-tubes-select'>
						Трубки
					</label>
					<select
						id='power-tubes-select'
						value={tubesInput}
						onChange={event => {
							setTubesInput((event.currentTarget as HTMLSelectElement).value)
							clearResults()
						}}
						class={fieldClass(false)}
					>
						<option value=''>любое</option>
						{[2, 3, 4, 5].map(count => (
							<option key={count} value={String(count)}>
								{count}
							</option>
						))}
					</select>
				</div>

				<div class='flex items-end'>
					<button
						type='button'
						disabled={hasErrors}
						onClick={runSearch}
						class='h-9 w-full rounded-lg bg-red-700 px-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-neutral-300 md:h-10'
					>
						Подобрать
					</button>
				</div>
			</div>

			{results && (
				<div class='mt-4 border-t border-neutral-100 pt-4'>
					<div class='text-xs font-medium uppercase tracking-[0.04em] text-neutral-500'>
						Результат (до {MAX_RESULTS} строк)
					</div>
					{searched ? (
						<p class='mt-1 text-[13px] leading-5 text-neutral-700'>
							{searched.origin.source === 'manual'
								? `Подбор под введённую мощность: ${fmtWatts(searched.demandHundredths)} Вт`
								: `Подбор под примерную потребность по помещению: ${fmtWatts(searched.demandHundredths)} Вт — ${estimateBranchText(searched.origin.room)}`}
						</p>
					) : null}

					{results.length === 0 && emptyState ? (
						<div class='mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 md:p-4'>
							<div class='font-semibold text-neutral-950'>{emptyState.title}</div>
							<p class='mt-1 text-[13px] leading-5'>{emptyState.text}</p>
							<a
								href={REQUEST_HREF}
								class='mt-2 inline-flex h-9 items-center rounded-lg bg-red-700 px-3 text-sm font-semibold text-white transition hover:bg-red-800'
							>
								Запросить расчёт менеджеру
							</a>
						</div>
					) : (
						<ul class='mt-2 space-y-2'>
							{results.map(candidate => {
								const expanded = expandedId === candidate.model.id
								return (
									<li
										key={candidate.model.id}
										class='rounded-xl border border-neutral-200 bg-neutral-50 p-3 md:p-4'
									>
										<a
											href={candidate.model.href}
											class='text-sm font-semibold leading-5 text-neutral-950 hover:text-red-700 md:text-base'
										>
											Velar {candidate.model.id} · {candidate.model.tubes}-трубчатый · {candidate.sections}{' '}
											{pluralSections(candidate.sections)}
										</a>
										<div class='mt-1 text-[13px] leading-5 text-neutral-700'>
											{candidate.length} × {candidate.model.depth} × {candidate.model.height} мм · мощность{' '}
											{fmtWatts(candidate.powerHundredths)} Вт при ΔT70 (95/85/20)
										</div>
										<div class='mt-0.5 text-[13px] leading-5 text-neutral-700'>
											Ориентировочная цена: {fmtRub(candidate.price)} (базовый цвет) · {sourceLabel(candidate.model.source)}
										</div>
										<div class='mt-2 flex flex-wrap items-center gap-2'>
											<button
												type='button'
												onClick={() => toggleOptions(candidate.model)}
												aria-expanded={expanded}
												class='h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 transition hover:border-red-300 hover:text-red-700'
											>
												{expanded ? 'Скрыть выбор исполнения' : 'Выбрать цвет и подключение'}
											</button>
											<a
												href={candidate.model.href}
												class='text-xs font-medium text-neutral-700 hover:text-red-700 hover:underline md:text-[13px]'
											>
												Открыть карточку
											</a>
										</div>
										{expanded && selectedColor && selectedConnection
											? (() => {
													const finalPriceValue = getFinalPrice(candidate.price, selectedColor, selectedConnection)
													const title = getCartTitle(candidate, selectedColor, selectedConnection, ralCode)
													const details = getCartDetails(candidate, selectedColor, selectedConnection, ralCode)
													const inCartQnty = shoppingCart.items.find(item => item.title === title)?.qnty ?? 0
													return (
														<div class='mt-3 rounded-xl border border-neutral-200 bg-white p-3'>
															<div class='grid gap-2 sm:grid-cols-2'>
																<div>
																	<label class={fieldLabelClass()} for='power-color-select'>
																		Цвет
																	</label>
																	<select
																		id='power-color-select'
																		value={selectedColor.id}
																		onChange={event => setColorId((event.currentTarget as HTMLSelectElement).value)}
																		class={fieldClass(false)}
																	>
																		{colors.map(color => (
																			<option key={color.id} value={color.id}>
																				{colorOptionLabel(color)}
																			</option>
																		))}
																	</select>
																</div>
																<div>
																	<label class={fieldLabelClass()} for='power-connection-select'>
																		Подключение
																	</label>
																	<select
																		id='power-connection-select'
																		value={selectedConnection.id}
																		onChange={event => setConnectionId((event.currentTarget as HTMLSelectElement).value)}
																		class={fieldClass(false)}
																	>
																		{availableConnections.map(connection => (
																			<option key={connection.id} value={connection.id}>
																				{connectionOptionLabel(connection)}
																			</option>
																		))}
																	</select>
																</div>
															</div>
															{selectedColor.id === ANY_RAL_COLOR_ID ? (
																<div class='mt-2'>
																	<label class={fieldLabelClass()} for='power-ral-input'>
																		Код RAL (если известен)
																	</label>
																	<input
																		id='power-ral-input'
																		type='text'
																		maxLength={20}
																		value={ralCode}
																		onInput={event => setRalCode((event.currentTarget as HTMLInputElement).value)}
																		placeholder='Например, 7016'
																		class={`mt-0.5 ${fieldClass(false)}`}
																	/>
																	<p class='mt-1 text-xs leading-5 text-neutral-600'>
																		Точный оттенок по шкале RAL менеджер подтвердит перед заказом; если код не указать —
																		согласуем оттенок с вами.
																	</p>
																</div>
															) : null}
															<div class='mt-2 text-[13px] leading-5 text-neutral-700'>
																<div>Базовый цвет: {fmtRub(candidate.price)}</div>
																<div>
																	Итог с выбранным цветом и подключением:{' '}
																	<span class='font-semibold text-neutral-950'>{fmtRub(finalPriceValue)}</span>
																</div>
																<div class='text-neutral-500'>
																	Мощность прибора от цвета и подключения не зависит:{' '}
																	{fmtWatts(candidate.powerHundredths)} Вт при ΔT70 (95/85/20).
																</div>
															</div>
															<div class='mt-2 flex flex-wrap items-center gap-2'>
																{inCartQnty === 0 ? (
																	<button
																		type='button'
																		onClick={() =>
																			addToCart({
																				title,
																				price: finalPriceValue,
																				details,
																				linkSlug: `/columns/${candidate.model.id}`,
																				itemType: 'radiator',
																			})
																		}
																		class='h-9 rounded-lg bg-red-700 px-3 text-sm font-semibold text-white transition hover:bg-red-800'
																	>
																		Добавить в заявку
																	</button>
																) : (
																	<span class='inline-flex h-9 items-center gap-2 text-sm font-medium text-green-700'>
																		Добавлено ({inCartQnty})
																		<a
																			href={CART_HREF}
																			class='inline-flex h-9 items-center rounded-lg bg-red-700 px-3 text-sm font-semibold text-white transition hover:bg-red-800'
																		>
																			Перейти к заявке
																		</a>
																	</span>
																)}
															</div>
														</div>
													)
												})()
											: null}
									</li>
								)
							})}
						</ul>
					)}

					<p class='mt-3 text-xs leading-5 text-neutral-600 md:text-[13px]'>
						Мощность в строках — мощность радиатора при ΔT70 (95/85/20); цвет и подключение на неё не влияют.
						Итоговая цена — ориентир: цена прибора в базовом цвете × множитель цвета + доплата за подключение;
						без арматуры, монтажа и доставки. Не заменяет проектный расчёт; финальную проверку делает менеджер.
					</p>
				</div>
			)}

			<p class='mt-3 text-xs leading-5 text-neutral-600 md:text-[13px]'>
				Нужен точный расчёт теплопотерь?{' '}
				<a href={REQUEST_HREF} class='font-medium text-red-700 hover:underline'>
					Запросите расчёт у менеджера
				</a>{' '}
				— без выбранной позиции.
			</p>
		</div>
	)
}
