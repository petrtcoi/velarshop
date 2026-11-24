import { formatDimensions } from '../../../../lib/productFormat'
import { useStore } from '@nanostores/preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import RadiatorFilter from './RadiatorFilter'
import RadiatorListHeader from './RadiatorListHeader'
import RadiatorRow from './RadiatorRow'

import SelectAddon from '@features/options/SelectAddons'
import SelectColumnColor, { columnColor, columnColorId } from '@features/options/SelectColumnColor'
import SelectColumnConnection, { columnConn, columnConnId } from '@features/options/SelectColumnConnection'
import SelectConvectorGrill from '@features/options/SelectConvectorGrill'
import SelectDesignColor, { designColor, designColorId } from '@features/options/SelectDesignColor'
import SelectConnection, { radiatorConn, radiatorConnId } from '@features/options/SelectConnection'
import SaveSelection, { buildSelectionPath, buildSelectionText, formatSectionsLabel, lowerFirst } from '@features/saveSelection'
import SelectIroncastColor from '@features/options/SelectIroncastColor'
import { addToCart, storeShoppingCart } from '@features/order/ShoppingCart'
import { getRadiatorTotalCost } from '@features/radiator/RadiatorTotalCost'
import { radiatorTotalTitle } from '@features/radiator/RadiatorTotalTitle'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { ALL } from '../constants/filterAll'
import { filterRadiators } from '../utils/filterRadiators'

import { columnColors } from '@entities/ColumnsColor'
import { designColors } from '@entities/DesignColor'
import { columnConnections } from '@entities/RadiatorConnection'

import type { ModelJson } from '@entities/Model'
import type { RadiatorJson } from '@entities/Radiator'

type Props = {
	model: ModelJson
	radiators: RadiatorJson[]
	initialFilteredRadiators: RadiatorJson[]
	heights: string[]
	lengths: string[]
	widths: string[]
	interAxes: string[]
	filterByHeight?: boolean
	filterByWidth?: boolean
	filterByLength?: boolean
	/** Трубчатые: модель той же высоты с большим числом трубок (для подсказки «Сколько секций нужно»). */
	moreTubesModel?: { name: string; href: string; maxPowerDt60: number } | null
}

// «Сколько секций нужно» (трубчатые и дизайн-радиаторы). Метод сайта: /info/power - площадь × 100 Вт/м²;
// /info/raschet-radiatorov-dlya-uglovoy-komnaty - потолки выше 3 м: +10% за каждые 0,5 м.
// Сравнение по ΔT 60 (график 90/70), как в /info/trubchatye-radiatory-velar-dlya-kvartiry.
const COLUMNS_VISIBLE_ROWS = 10
// Дизайн-радиаторы: короткий список только если строк 12 и больше, иначе показываем все и просто выделяем.
const DESIGN_MIN_ROWS_FOR_WINDOW = 12
const POWER_PER_M2 = 100
const DEFAULT_CEILING = 2.7

type PowerNeed = { area: number; ceiling: number; factor: number; watts: number }

function parseDecimal(value: string | undefined): number {
	if (!value) return 0
	const parsed = Number.parseFloat(value.replace(',', '.').trim())
	return Number.isFinite(parsed) ? parsed : 0
}

function formatDecimal(value: number): string {
	return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

function formatWatts(value: number): string {
	return Math.round(value).toLocaleString('ru-RU')
}

function getCeilingFactor(ceiling: number): number {
	if (ceiling <= 3) return 1
	return Math.round((1 + 0.2 * (ceiling - 3)) * 100) / 100
}

/** Подпись строки для покупателя. Идентификатор позиции в корзине (getTotalTitle) не меняется. */
function getColumnsRowLabel(
	model: ModelJson,
	radiator: RadiatorJson,
	connection: { description: string } | null | undefined,
	color: { title: string } | null | undefined,
): string {
	const parts = [`Velar ${model.name}`, formatSectionsLabel(radiator.sections)]
	if (connection) parts.push(lowerFirst(connection.description.replace(/\s*\(.*\)\s*$/, '').replace('подключение ', '')))
	if (color) parts.push(/^[А-Я]/.test(color.title) ? lowerFirst(color.title) : color.title)
	return parts.filter(Boolean).join(', ')
}

/** Дизайн-радиаторы: «Velar P30 V, 270 мм, 2 секции, боковое, белый RAL 9016 глянец». Только для показа. */
function getDesignRowLabel(
	model: ModelJson,
	radiator: RadiatorJson,
	connection: { description: string } | null | undefined,
	color: { title: string } | null | undefined,
): string {
	const modelName = model.name.replace(/^([A-Z]+)\s+(\d)/, '$1$2')
	// Вертикальные различаются высотой и секциями, горизонтальные - высотой и длиной.
	const size = model.orientation === 'vertical' ? `${radiator.height} мм` : `${radiator.height} × ${radiator.length} мм`
	const parts = [`Velar ${modelName}`, size, formatSectionsLabel(radiator.sections)]
	if (connection) {
		parts.push(
			lowerFirst(
				connection.description
					.replace(/\s*\(.*\)\s*$/, '')
					.replace(/подключение\s*/, '')
					.replace(/\s+/g, ' ')
					.trim(),
			),
		)
	}
	if (color) parts.push(/^[А-Я]/.test(color.title) ? lowerFirst(color.title) : color.title)
	return parts.filter(Boolean).join(', ')
}

function getPowerValue(radiator: RadiatorJson): string {
	return radiator.dt70 || radiator.dt60 || radiator.dt50 || '—'
}

function getSizeLabel(model: ModelJson, radiator: RadiatorJson): string {
	if (model.type === 'convector') return formatDimensions(model.type, radiator)
	if (model.orientation === 'horizontal') {
		return `${radiator.height} × ${radiator.length} мм`
	}
	if (model.orientation === 'vertical') {
		return `${radiator.height} × ${radiator.length} мм`
	}
	return `${radiator.height} × ${radiator.length} × ${radiator.width} мм`
}

function getCartItemDetails(model: ModelJson, radiator: RadiatorJson): string {
	const dimensions = model.type === 'convector' ? formatDimensions(model.type, radiator) :
		model.orientation === 'vertical' || model.orientation === 'horizontal'
			? `${radiator.height}x${radiator.length} мм`
			: `${radiator.height}x${radiator.length}x${radiator.width} мм`

	return `${dimensions} / ${getPowerValue(radiator)} Вт`
}

function RadiatorList(props: Props) {
	const {
		model,
		radiators,
		initialFilteredRadiators,
		heights,
		lengths,
		widths,
		interAxes,
		filterByHeight = false,
		filterByWidth = false,
		filterByLength = false,
		moreTubesModel = null,
	} = props

	const [lastFilterUpdate, setLastFilterUpdate] = useState<'length' | 'height' | 'width' | 'interAxis'>('height')
	const [selectedHeight, setSelectedHeight] = useState<string>(ALL)
	const [selectedWidth, setSelectedWidth] = useState<string>(ALL)
	const [selectedLength, setSelectedLength] = useState<string>(ALL)
	const [selectedInterAxis, setSelectedInterAxis] = useState<string>(ALL)
	const [requestedHeight, setRequestedHeight] = useState<string | null>(null)
	const [requestedCollection, setRequestedCollection] = useState<string | null>(null)
	const [requestedConnection, setRequestedConnection] = useState<string | null>(null)
	const [urlFiltersReady, setUrlFiltersReady] = useState(false)
	const shouldScrollToVariants = useRef(false)
	const [filteredRadiators, setFilteredRadiators] = useState<RadiatorJson[]>(initialFilteredRadiators)
	const showTemperatureModes = ['p30v', 'p30h', 'r42v', 'r42h'].includes(model.id)
	const shoppingCart = useStore(storeShoppingCart)
	const getTotalCost = useStore(getRadiatorTotalCost)
	const getTotalTitle = useStore(radiatorTotalTitle)
	const activeRadiatorConn = useStore(radiatorConn)
	const activeColumnConn = useStore(columnConn)
	const activeDesignColor = useStore(designColor)
	const activeColumnColor = useStore(columnColor)
	const [requestedRadiatorSlug, setRequestedRadiatorSlug] = useState<string | null>(null)
	const scrollToRadiatorSlug = useRef<string | null>(null)
	const isColumns = model.type === 'columns'
	const isDesign = model.type === 'design'
	const hasPowerHelper = isColumns || isDesign
	const [roomArea, setRoomArea] = useState('')
	const [ceilingHeight, setCeilingHeight] = useState('2,7')
	const [powerNeed, setPowerNeed] = useState<PowerNeed | null>(null)
	const [powerError, setPowerError] = useState('')
	const [showAllRows, setShowAllRows] = useState(false)
	const scrollToSuggested = useRef(false)

	const changeHeightFilter = (height: string) => {
		setSelectedHeight(height)
		setLastFilterUpdate('height')

		if (requestedHeight) {
			setRequestedHeight(null)
			const url = new URL(window.location.href)
			url.searchParams.delete('height')
			url.searchParams.delete('collection')
			window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
		}
	}
	const changeWidthFilter = (width: string) => {
		setSelectedWidth(width)
		setLastFilterUpdate('width')
	}
	const changeLengthFilter = (length: string) => {
		setSelectedLength(length)
		setLastFilterUpdate('length')
	}

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search)
		const requestedInterAxis = searchParams.get('mo')
		const height = searchParams.get('height')
		const collection = searchParams.get('collection')
		const connection = searchParams.get('connection')
		const radiatorSlug = searchParams.get('radiator')
		const requestedConnectionId = searchParams.get('connection')
		const requestedColorId = searchParams.get('color')
		let hasValidContextFilter = false

		if (requestedInterAxis && interAxes.includes(requestedInterAxis)) {
			setSelectedInterAxis(requestedInterAxis)
			setLastFilterUpdate('interAxis')
			hasValidContextFilter = true
		}

		if (height && heights.includes(height)) {
			setSelectedHeight(height)
			setLastFilterUpdate('height')
			setRequestedHeight(height)
			setRequestedCollection(collection)
			hasValidContextFilter = true
		}

		if (connection === 'side') {
			let sideConnectionApplied = model.type === 'ironcast'
			if ((model.type === 'design' || model.type === 'floor') && model.connections.split(',').includes('lat')) {
				radiatorConnId.set('lat')
				sideConnectionApplied = true
			}
			if (model.type === 'columns') {
				columnConnId.set('lat1/2')
				sideConnectionApplied = true
			}
			if (sideConnectionApplied) {
				setRequestedConnection('side')
				hasValidContextFilter = true
			}
		}

		// Saved selection ("Сохранить подбор"): ?radiator=<slug>&connection=<id>&color=<id>
		if (requestedConnectionId && requestedConnectionId !== 'side') {
			if ((model.type === 'design' || model.type === 'floor') && model.connections.split(',').includes(requestedConnectionId)) {
				radiatorConnId.set(requestedConnectionId)
			}
			if (model.type === 'columns' && columnConnections.some(item => item.id === requestedConnectionId)) {
				columnConnId.set(requestedConnectionId)
			}
		}
		if (requestedColorId) {
			if (model.type === 'design' && designColors.some(item => item.id === requestedColorId)) designColorId.set(requestedColorId)
			if (model.type === 'columns' && columnColors.some(item => item.id === requestedColorId)) columnColorId.set(requestedColorId)
		}
		if (radiatorSlug && radiators.some(item => item.slug === radiatorSlug)) {
			setRequestedRadiatorSlug(radiatorSlug)
			scrollToRadiatorSlug.current = radiatorSlug
		}

		shouldScrollToVariants.current = hasValidContextFilter || Boolean(scrollToRadiatorSlug.current)
		setUrlFiltersReady(true)
	}, [])

	useEffect(() => {
		const radiator = radiators.find(
			r =>
				(selectedHeight === ALL || r.height === selectedHeight) &&
				(selectedWidth === ALL || r.width === selectedWidth) &&
				(selectedLength === ALL || r.length === selectedLength) &&
				(selectedInterAxis === ALL || r.n_spacing === selectedInterAxis),
		)
		if (radiator) return

		const escapeRadiator = radiators.find(
			r =>
				(selectedHeight === ALL || (!requestedHeight && lastFilterUpdate !== 'height') || r.height === selectedHeight) &&
				(selectedWidth === ALL || lastFilterUpdate !== 'width' || r.width === selectedWidth) &&
				(selectedLength === ALL || lastFilterUpdate !== 'length' || r.length === selectedLength) &&
				(selectedInterAxis === ALL || r.n_spacing === selectedInterAxis),
		)

		if (escapeRadiator) {
			if (!requestedHeight && lastFilterUpdate !== 'height' && selectedHeight !== ALL) setSelectedHeight(escapeRadiator.height)
			if (lastFilterUpdate !== 'width' && selectedWidth !== ALL) setSelectedWidth(escapeRadiator.width)
			if (lastFilterUpdate !== 'length' && selectedLength !== ALL) setSelectedLength(escapeRadiator.length)
		}
	}, [filteredRadiators, lastFilterUpdate, requestedHeight, selectedHeight, selectedInterAxis, selectedLength, selectedWidth])

	const [availableHeights, setAvailableHeights] = useState<string[]>(heights)
	const [availableWidths, setAvailableWidths] = useState<string[]>(widths)
	const [availableLengths, setAvailableLengths] = useState<string[]>(lengths)

	useEffect(() => {
		setAvailableHeights(
			heights.filter(h =>
				radiators.some(
					r =>
						h === r.height &&
						(selectedWidth === ALL || r.width === selectedWidth) &&
						(selectedLength === ALL || r.length === selectedLength) &&
						(selectedInterAxis === ALL || r.n_spacing === selectedInterAxis),
				),
			),
		)
		setAvailableWidths(
			widths.filter(w =>
				radiators.some(
					r =>
						w === r.width &&
						(selectedHeight === ALL || r.height === selectedHeight) &&
						(selectedLength === ALL || r.length === selectedLength) &&
						(selectedInterAxis === ALL || r.n_spacing === selectedInterAxis),
				),
			),
		)
		setAvailableLengths(
			lengths.filter(l =>
				radiators.some(
					r =>
						l === r.length &&
						(selectedHeight === ALL || r.height === selectedHeight) &&
						(selectedWidth === ALL || r.width === selectedWidth) &&
						(selectedInterAxis === ALL || r.n_spacing === selectedInterAxis),
				),
			),
		)
	}, [selectedHeight, selectedWidth, selectedLength, selectedInterAxis])

	useEffect(() => {
		if (!urlFiltersReady) return

		setFilteredRadiators(filterRadiators({
			radiators,
			selectedHeight,
			selectedLength,
			selectedWidth,
			selectedInterAxis,
		}))

		if (!shouldScrollToVariants.current) {
			document.documentElement.classList.remove('model-context-pending')
			return
		}

		shouldScrollToVariants.current = false
		let secondFrame = 0
		const firstFrame = window.requestAnimationFrame(() => {
			secondFrame = window.requestAnimationFrame(() => {
				document.documentElement.classList.remove('model-context-pending')
				const root = document.documentElement
				const previousScrollBehavior = root.style.scrollBehavior
				root.style.scrollBehavior = 'auto'
				const savedSlug = scrollToRadiatorSlug.current
				scrollToRadiatorSlug.current = null
				const savedTarget = savedSlug
					? [`radiator-row-${savedSlug}`, `radiator-card-${savedSlug}`]
							.map(id => document.getElementById(id))
							.find(element => element && element.offsetParent !== null)
					: null
				if (savedTarget) savedTarget.scrollIntoView({ block: 'center' })
				else document.getElementById('model-variants')?.scrollIntoView({ block: 'start' })
				root.style.scrollBehavior = previousScrollBehavior
			})
		})

		return () => {
			window.cancelAnimationFrame(firstFrame)
			if (secondFrame) window.cancelAnimationFrame(secondFrame)
		}
	}, [selectedHeight, selectedWidth, selectedLength, selectedInterAxis, urlFiltersReady])

	const showInterAxis = model.type !== 'convector' && model.type !== 'floor'
	const modelHref = getModelSlug(model)
	const hasConfiguratorOptions = model.type !== 'convector'
	const hasContextFilter = Boolean(requestedHeight) || selectedInterAxis !== ALL || requestedConnection === 'side'
	const hasLockedSideConnection = requestedConnection === 'side'
	const hasInterAxisCollection = ['300', '450', '500'].includes(selectedInterAxis)
	const interAxisCollectionHref = hasInterAxisCollection
		? `/collections/radiatory-mezhosevoe-rasstoyanie-${selectedInterAxis}-mm`
		: ''
	const heightCollectionHref = requestedHeight && requestedCollection === `height-${requestedHeight}`
		? `/collections/radiatory-vysotoy-${requestedHeight}-mm`
		: requestedHeight && requestedCollection === 'vertical-1800'
			? '/collections/verticalnye-radiatory-1800-mm'
			: ''
	const heightCollectionLabel = requestedCollection === 'vertical-1800'
		? 'Смотреть все модели высотой около 1800 мм'
		: `Смотреть все модели высотой ${requestedHeight} мм`

	const resetContextFilter = () => {
		window.location.assign(`${modelHref}#model-variants`)
	}

	// Строка, которая покрывает расчетную потребность при ΔT 60. У трубчатых (одна высота) это наименьшая
	// по мощности; у дизайн-радиаторов (много высот и длин) самая дешевая из подходящих, при равной цене меньшая по мощности.
	const suggestedRadiator = hasPowerHelper && powerNeed
		? filteredRadiators.reduce<RadiatorJson | null>((best, radiator) => {
				const power = parseDecimal(radiator.dt60)
				if (power < powerNeed.watts) return best
				if (!best) return radiator
				if (isDesign) {
					const price = getTotalCost(model, radiator)
					const bestPrice = getTotalCost(model, best)
					if (price < bestPrice || (price === bestPrice && power < parseDecimal(best.dt60))) return radiator
					return best
				}
				if (power < parseDecimal(best.dt60)) return radiator
				return best
			}, null)
		: null
	const suggestedSlug = suggestedRadiator?.slug ?? null
	const canUseMoreTubesModel = Boolean(moreTubesModel && powerNeed && moreTubesModel.maxPowerDt60 >= powerNeed.watts)

	// Короткий список: 10 строк вокруг подходящей (или первые 10); строка из сохраненной ссылки видна всегда.
	const usesRowWindow =
		(isColumns && filteredRadiators.length > COLUMNS_VISIBLE_ROWS) ||
		(isDesign && filteredRadiators.length >= DESIGN_MIN_ROWS_FOR_WINDOW)
	const getDisplayedRadiators = (): RadiatorJson[] => {
		if (!usesRowWindow || showAllRows) return filteredRadiators
		const anchorSlug = suggestedSlug ?? requestedRadiatorSlug
		const anchorIndex = anchorSlug ? filteredRadiators.findIndex(radiator => radiator.slug === anchorSlug) : -1
		const start = anchorIndex < 0
			? 0
			: Math.max(0, Math.min(anchorIndex - Math.floor(COLUMNS_VISIBLE_ROWS / 2) + 1, filteredRadiators.length - COLUMNS_VISIBLE_ROWS))
		return filteredRadiators.filter((radiator, index) =>
			(index >= start && index < start + COLUMNS_VISIBLE_ROWS) ||
			radiator.slug === requestedRadiatorSlug ||
			radiator.slug === suggestedSlug,
		)
	}
	const displayedRadiators = getDisplayedRadiators()
	const hasHiddenRows = displayedRadiators.length < filteredRadiators.length
	// Все строки остаются в HTML (размеры и цены видны поисковикам), строки вне окна только скрыты.
	const displayedSlugs = new Set(displayedRadiators.map(radiator => radiator.slug))

	const isHighlightedRow = (radiator: RadiatorJson) => radiator.slug === requestedRadiatorSlug || radiator.slug === suggestedSlug
	const getRowLabel = (radiator: RadiatorJson, totalTitle: string) =>
		isColumns
			? getColumnsRowLabel(model, radiator, activeColumnConn, activeColumnColor)
			: isDesign
				? getDesignRowLabel(model, radiator, activeRadiatorConn, activeDesignColor)
				: totalTitle
	const isHeightFiltered = selectedHeight !== ALL

	const submitPowerNeed = (event: Event) => {
		event.preventDefault()
		const area = parseDecimal(roomArea)
		if (area <= 0 || area > 1000) {
			setPowerNeed(null)
			setPowerError('Введите площадь комнаты, например 18')
			return
		}
		const parsedCeiling = parseDecimal(ceilingHeight)
		const ceiling = parsedCeiling >= 1.5 && parsedCeiling <= 10 ? parsedCeiling : DEFAULT_CEILING
		const factor = getCeilingFactor(ceiling)
		const watts = Math.ceil((area * POWER_PER_M2 * factor) / 10) * 10
		setPowerError('')
		setPowerNeed({ area, ceiling, factor, watts })
		scrollToSuggested.current = true
	}

	useEffect(() => {
		if (!scrollToSuggested.current) return
		scrollToSuggested.current = false
		if (!suggestedSlug) return
		const frame = window.requestAnimationFrame(() => {
			const target = [`radiator-row-${suggestedSlug}`, `radiator-card-${suggestedSlug}`]
				.map(id => document.getElementById(id))
				.find(element => element && element.offsetParent !== null)
			target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
		})
		return () => window.cancelAnimationFrame(frame)
	}, [powerNeed, suggestedSlug])

	const addRadiatorToRequest = (radiator: RadiatorJson) => {
		const title = getTotalTitle(model, radiator)
		addToCart({
			title,
			price: getTotalCost(model, radiator),
			details: getCartItemDetails(model, radiator),
			linkSlug: modelHref,
			itemType: 'radiator',
		})
	}

	const canSaveSelection = model.type === 'design' || model.type === 'columns'
	const renderSaveSelection = (radiator: RadiatorJson, align: 'start' | 'end') => {
		if (model.type !== 'design' && model.type !== 'columns') return null
		const connection = model.type === 'columns' ? activeColumnConn : activeRadiatorConn
		const color = model.type === 'columns' ? activeColumnColor : activeDesignColor
		const price = getTotalCost(model, radiator)
		const isHorizontal = model.orientation === 'horizontal'
		const modelName = model.type === 'columns' ? model.name : model.name.replace(/\s/g, '')
		const text = buildSelectionText(
			[
				`Velar ${modelName}`,
				radiator.height ? `высота ${radiator.height} мм` : '',
				model.type === 'design' && isHorizontal && radiator.length ? `длина ${radiator.length} мм` : '',
				formatSectionsLabel(radiator.sections),
				connection ? lowerFirst(connection.description) : '',
				color ? lowerFirst(color.title) : '',
			],
			price,
		)
		const path = buildSelectionPath(modelHref, radiator.slug, connection?.id ?? '', color?.id ?? '')
		return (
			<SaveSelection
				path={path}
				text={text}
				model={model.id}
				compact
				managerLine='opened'
				align={align}
			/>
		)
	}

	const getRadiatorQnty = (radiator: RadiatorJson) => {
		const itemTitle = getTotalTitle(model, radiator)
		return shoppingCart.items.find(item => item.title === itemTitle)?.qnty || 0
	}

	return (
		<div
			id='radiators-list'
			class='mt-5'
		>
			<div>
				{hasContextFilter && (
					<div class='mb-4 flex flex-col gap-3 border-y border-red-200 bg-red-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between'>
						<div>
							<div class='text-sm font-medium text-neutral-950'>Показаны подходящие конфигурации</div>
							<div class='mt-1 text-xs font-normal leading-5 text-neutral-700'>
								{requestedHeight ? `Высота ${requestedHeight} мм` : ''}
								{requestedHeight && (selectedInterAxis !== ALL || requestedConnection === 'side') ? ' · ' : ''}
								{selectedInterAxis !== ALL ? `Межосевое расстояние ${selectedInterAxis} мм` : ''}
								{selectedInterAxis !== ALL && requestedConnection === 'side' ? ' · ' : ''}
								{requestedConnection === 'side' ? 'боковое подключение' : ''}
							</div>
						</div>
						<button type='button' onClick={resetContextFilter} class='inline-flex h-9 shrink-0 items-center justify-center rounded-[3px] border border-red-300 bg-white px-3 text-xs font-medium text-red-700 transition hover:border-red-700'>
							Сбросить подборку
						</button>
					</div>
				)}

				{hasConfiguratorOptions && (
					<div class='mb-4 grid gap-3 border-y border-neutral-200 py-4 md:grid-cols-2'>
						{hasLockedSideConnection && (model.type === 'design' || model.type === 'floor' || model.type === 'columns') ? (
							<div class='mt-5 mb-2'>
								<div class='text-xs font-normal text-neutral-600'>Подключение радиатора:</div>
								<div class='mt-2 flex min-h-10 items-center justify-between gap-3 rounded-[3px] border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-950'>
									<span class='font-medium'>Боковое подключение</span>
									<span class='text-xs font-normal text-neutral-500'>зафиксировано подборкой</span>
								</div>
							</div>
						) : (
							<>
								{(model.type === 'design' || model.type === 'floor') && <SelectConnection model={model} />}
								{model.type === 'columns' && <SelectColumnConnection model={model} />}
							</>
						)}
						{model.type === 'design' && <SelectDesignColor />}
						{model.type === 'columns' && <SelectColumnColor />}
						{model.type === 'ironcast' && <SelectIroncastColor />}
					</div>
				)}

				{filterByLength && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Длина (мм)' : 'Длина'}
						options={lengths}
						availableOptions={availableLengths}
						selectedOption={selectedLength}
						setSelectedOption={changeLengthFilter}
						showAllOption
					/>
				)}
				{filterByHeight && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Высота (мм)' : 'Высота'}
						options={heights}
						availableOptions={availableHeights}
						selectedOption={selectedHeight}
						setSelectedOption={changeHeightFilter}
						showAllOption
					/>
				)}
				{filterByWidth && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Ширина короба (мм)' : 'Глубина'}
						options={widths}
						availableOptions={availableWidths}
						selectedOption={selectedWidth}
						setSelectedOption={changeWidthFilter}
						showAllOption
					/>
				)}

				{hasPowerHelper && (
					<form class='mb-4 border-b border-neutral-200 pb-4' onSubmit={submitPowerNeed} noValidate>
						<div class='text-sm font-medium text-neutral-950'>Сколько секций нужно</div>
						<div class='mt-2 flex flex-wrap items-end gap-3'>
							<label class='block'>
								<span class='block text-xs font-normal text-neutral-600'>Площадь комнаты, м²</span>
								<input
									type='text'
									inputMode='decimal'
									value={roomArea}
									placeholder='18'
									onInput={event => setRoomArea((event.currentTarget as HTMLInputElement).value)}
									class='mt-1 h-10 w-32 rounded-[3px] border border-neutral-300 bg-white px-3 text-base font-normal text-neutral-950 outline-none transition focus:border-red-500 md:text-sm'
								/>
							</label>
							<label class='block'>
								<span class='block text-xs font-normal text-neutral-600'>Высота потолка, м</span>
								<input
									type='text'
									inputMode='decimal'
									value={ceilingHeight}
									onInput={event => setCeilingHeight((event.currentTarget as HTMLInputElement).value)}
									class='mt-1 h-10 w-24 rounded-[3px] border border-neutral-300 bg-white px-3 text-base font-normal text-neutral-950 outline-none transition focus:border-red-500 md:text-sm'
								/>
							</label>
							<button
								type='submit'
								class='inline-flex h-10 items-center justify-center rounded-[3px] border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-50'
							>
								Подобрать
							</button>
						</div>
						{powerError && <p class='mt-3 text-xs font-normal leading-5 text-red-700'>{powerError}</p>}
						{powerNeed && (
							<p class='mt-3 max-w-3xl text-xs font-normal leading-5 text-neutral-700'>
								Нужно около {formatWatts(powerNeed.watts)} Вт: {formatDecimal(powerNeed.area)} м² × {POWER_PER_M2} Вт/м²
								{powerNeed.factor > 1
									? ` × ${formatDecimal(powerNeed.factor)} (потолок ${formatDecimal(powerNeed.ceiling)} м: +10% за каждые 0,5 м выше 3 м).`
									: `, потолок ${formatDecimal(powerNeed.ceiling)} м.`}{' '}
								{suggestedRadiator && isDesign ? (
									<>
										{isHeightFiltered
											? `При высоте ${suggestedRadiator.height} мм подходит ${formatSectionsLabel(suggestedRadiator.sections)}`
											: `Подходит вариант высотой ${suggestedRadiator.height} мм, ${formatSectionsLabel(suggestedRadiator.sections)}`}
										{model.orientation !== 'vertical' ? `, длина ${suggestedRadiator.length} мм` : ''}: {formatWatts(parseDecimal(suggestedRadiator.dt60))} Вт при ΔT 60 (график 90/70)
										{isHeightFiltered ? '' : ', это самый недорогой подходящий вариант среди всех высот'}, строка выделена в списке. В таблице мощность указана при ΔT 70.{' '}
									</>
								) : suggestedRadiator ? (
									<>
										Подходит {formatSectionsLabel(suggestedRadiator.sections)}: {formatWatts(parseDecimal(suggestedRadiator.dt60))} Вт при ΔT 60 (график 90/70), строка выделена в списке. В таблице мощность указана при ΔT 70.{' '}
									</>
								) : isDesign ? (
									<>
										{isHeightFiltered
											? `При высоте ${selectedHeight} мм одной батареи не хватит, нужны две или другая высота. `
											: 'Одной батареи не хватит, нужно две. '}
									</>
								) : (
									<>
										Одной батареи не хватит, нужно две или модель с большим числом трубок.{' '}
										{canUseMoreTubesModel && moreTubesModel && (
											<>
												<a href={moreTubesModel.href} class='text-red-700 underline decoration-red-300 underline-offset-2 transition hover:decoration-transparent'>
													Смотреть Velar {moreTubesModel.name}
												</a>
												.{' '}
											</>
										)}
									</>
								)}
								Это ориентир, точный расчет сделает менеджер.
							</p>
						)}
					</form>
				)}

				{model.type === 'convector' && (
					<>
						<SelectConvectorGrill />
						<SelectAddon model={model} />

						<div class='mt-5 hidden overflow-x-auto md:block'>
							<table class='w-full min-w-[720px] text-left text-xs'>
								<RadiatorListHeader showInterAxis={showInterAxis} />
								<tbody>
									{filteredRadiators.map(radiator => (
										<RadiatorRow
											model={model}
											radiator={radiator}
											showInterAxis={showInterAxis}
										/>
									))}
								</tbody>
							</table>
						</div>

						<div class='mt-4 grid gap-2 md:hidden'>
							{filteredRadiators.map(radiator => {
								const qnty = getRadiatorQnty(radiator)
								const totalTitle = getTotalTitle(model, radiator)
								const totalPrice = getTotalCost(model, radiator)
								return (
									<article class='rounded-[3px] border border-neutral-200 bg-white p-2.5'>
										<div class='text-xs font-normal leading-5 text-neutral-950'>{totalTitle}</div>
										<div class='mt-1 text-xs leading-5 text-neutral-700'>
											Размер: {getSizeLabel(model, radiator)} · Мощность: {getPowerValue(radiator)} Вт
										</div>
										<div class='mt-2 flex items-center justify-between gap-3'>
											<div class='text-base font-semibold text-neutral-950'>от {totalPrice.toLocaleString('ru-RU')} ₽</div>
											<button
												type='button'
												onClick={() => addRadiatorToRequest(radiator)}
												class='inline-flex min-h-11 shrink-0 items-center justify-center rounded-[3px] border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-50'
											>
												{qnty > 0 ? `В корзине: ${qnty}` : 'В корзину'}
											</button>
										</div>
									</article>
								)
							})}
						</div>
					</>
				)}

				{model.type !== 'convector' && (
					<div class='mt-4 hidden overflow-x-auto border border-neutral-200 md:block'>
						<table class='w-full min-w-[720px] border-collapse text-left text-xs font-normal'>
							<thead>
								<tr class='border-b border-neutral-200 bg-neutral-100 text-xs font-normal uppercase tracking-[0.04em] text-neutral-600'>
									<th class='px-2.5 py-2 font-normal'>Модель / размер</th>
									<th class='px-2.5 py-2 text-center font-normal'>Высота</th>
									<th class='px-2.5 py-2 text-center font-normal'>М/о</th>
									<th class='px-2.5 py-2 text-center font-normal'>Длина</th>
									<th class='px-2.5 py-2 text-center font-normal'>Мощность</th>
									<th class='px-2.5 py-2 text-right font-normal'>Цена</th>
									<th class='px-2.5 py-2 text-right font-normal'>Действие</th>
								</tr>
							</thead>
							<tbody>
								{filteredRadiators.map(radiator => {
									const qnty = getRadiatorQnty(radiator)
									const totalTitle = getTotalTitle(model, radiator)
									const totalPrice = getTotalCost(model, radiator)
									return (
										<tr
											id={`radiator-row-${radiator.slug}`}
											hidden={!displayedSlugs.has(radiator.slug)}
											class={`border-b border-neutral-200 text-xs font-normal text-neutral-800 transition last:border-b-0 ${
												isHighlightedRow(radiator) ? 'bg-red-50' : 'hover:bg-neutral-50'
											}`}
										>
											<td class='px-2.5 py-2.5'>
												<div class='font-normal text-neutral-900'>
													{getRowLabel(radiator, totalTitle)}
												</div>
												{radiator.slug === suggestedSlug && (
													<div class='mt-0.5 text-xs font-normal text-red-700'>
														Подходит по расчету: {formatWatts(parseDecimal(radiator.dt60))} Вт при ΔT 60
													</div>
												)}
											</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.height} мм</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.n_spacing ? `${radiator.n_spacing} мм` : '—'}</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.length} мм</td>
											<td class='px-2.5 py-2.5 text-center'>
												<span class='whitespace-nowrap'>{showTemperatureModes ? 'ΔT70: ' : ''}{getPowerValue(radiator)} Вт</span>
												{showTemperatureModes && (
													<span class='mt-1 block leading-5 text-neutral-600'>
														<span class='block whitespace-nowrap'>ΔT60: {radiator.dt60} Вт</span>
														<span class='block whitespace-nowrap'>ΔT50: {radiator.dt50} Вт</span>
													</span>
												)}
											</td>
											<td class='px-2.5 py-2.5 text-right font-normal'>
												{totalPrice.toLocaleString('ru-RU')} ₽
											</td>
											<td class='px-2.5 py-2.5 text-right'>
												<button
													type='button'
													onClick={() => addRadiatorToRequest(radiator)}
													class='inline-flex h-7 items-center justify-center rounded-[3px] border border-red-200 bg-white px-2.5 text-xs font-normal text-red-700 transition hover:border-red-700 hover:bg-red-50'
												>
													{qnty > 0 ? `В корзине: ${qnty}` : 'В корзину'}
												</button>
												{canSaveSelection && (qnty > 0 || radiator.slug === requestedRadiatorSlug) && <div class='mt-2'>{renderSaveSelection(radiator, 'end')}</div>}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}

				{model.type !== 'convector' && (
					<div class='mt-4 grid gap-2 md:hidden'>
						{filteredRadiators.map(radiator => {
							const qnty = getRadiatorQnty(radiator)
							const totalTitle = getTotalTitle(model, radiator)
							const totalPrice = getTotalCost(model, radiator)
							return (
								<article
									id={`radiator-card-${radiator.slug}`}
									hidden={!displayedSlugs.has(radiator.slug)}
									class={`rounded-[3px] border p-2.5 ${
										isHighlightedRow(radiator) ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-white'
									}`}
								>
									<div class='text-xs font-normal leading-5 text-neutral-950'>
										{getRowLabel(radiator, totalTitle)}
									</div>
									{radiator.slug === suggestedSlug && (
										<div class='mt-0.5 text-xs font-normal leading-5 text-red-700'>
											Подходит по расчету: {formatWatts(parseDecimal(radiator.dt60))} Вт при ΔT 60
										</div>
									)}
									<div class='mt-1 text-xs leading-5 text-neutral-700'>
										Высота: {radiator.height} мм · М/о: {radiator.n_spacing || '—'} мм · Длина: {radiator.length} мм · Мощность{showTemperatureModes ? ' ΔT70' : ''}: {getPowerValue(radiator)} Вт
										{showTemperatureModes && <span class='block'>ΔT60: {radiator.dt60} Вт · ΔT50: {radiator.dt50} Вт</span>}
									</div>
									<div class='mt-2 flex items-center justify-between gap-3'>
										<div class='text-base font-semibold text-neutral-950'>
											{isColumns || isDesign ? '' : 'от '}{totalPrice.toLocaleString('ru-RU')} ₽
										</div>
										<button
											type='button'
											onClick={() => addRadiatorToRequest(radiator)}
											class='inline-flex min-h-11 shrink-0 items-center justify-center rounded-[3px] border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-50'
										>
											{qnty > 0 ? `В корзине: ${qnty}` : 'В корзину'}
										</button>
									</div>
									{canSaveSelection && (qnty > 0 || radiator.slug === requestedRadiatorSlug) && <div class='mt-2'>{renderSaveSelection(radiator, 'start')}</div>}
								</article>
							)
						})}
					</div>
				)}

				{hasPowerHelper && hasHiddenRows && (
					<div class='mt-4 flex justify-center'>
						<button
							type='button'
							onClick={() => setShowAllRows(true)}
							class='inline-flex h-10 items-center justify-center rounded-[3px] border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-900 transition hover:border-neutral-500'
						>
							Все размеры ({filteredRadiators.length})
						</button>
					</div>
				)}

				{interAxisCollectionHref && (
					<div class='mt-5'>
						<a
							href={interAxisCollectionHref}
							class='text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 transition hover:decoration-transparent'
						>
							Смотреть все модели с м/о {selectedInterAxis} мм
						</a>
					</div>
				)}

				{heightCollectionHref && (
					<div class='mt-5'>
						<a
							href={heightCollectionHref}
							class='text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 transition hover:decoration-transparent'
						>
							{heightCollectionLabel}
						</a>
					</div>
				)}
			</div>
		</div>
	)
}

export default RadiatorList
