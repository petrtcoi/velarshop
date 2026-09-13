import { useStore } from '@nanostores/preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import RadiatorFilter from './RadiatorFilter'
import RadiatorListHeader from './RadiatorListHeader'
import RadiatorRow from './RadiatorRow'

import SelectAddon from '@features/options/SelectAddons'
import SelectColumnColor from '@features/options/SelectColumnColor'
import SelectColumnConnection, { columnConnId } from '@features/options/SelectColumnConnection'
import SelectConvectorGrill from '@features/options/SelectConvectorGrill'
import SelectDesignColor from '@features/options/SelectDesignColor'
import SelectConnection, { radiatorConnId } from '@features/options/SelectConnection'
import SelectIroncastColor from '@features/options/SelectIroncastColor'
import { addToCart, storeShoppingCart } from '@features/order/ShoppingCart'
import { getRadiatorTotalCost } from '@features/radiator/RadiatorTotalCost'
import { radiatorTotalTitle } from '@features/radiator/RadiatorTotalTitle'
import { getModelSlug } from '@shared/utils/getModelSlug'
import { ALL } from '../constants/filterAll'
import { filterRadiators } from '../utils/filterRadiators'

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
}

function getPowerValue(radiator: RadiatorJson): string {
	return radiator.dt70 || radiator.dt60 || radiator.dt50 || '—'
}

function getSizeLabel(model: ModelJson, radiator: RadiatorJson): string {
	if (model.orientation === 'horizontal') {
		return `${radiator.height} × ${radiator.length} мм`
	}
	if (model.orientation === 'vertical') {
		return `${radiator.height} × ${radiator.length} мм`
	}
	return `${radiator.height} × ${radiator.length} × ${radiator.width} мм`
}

function getCartItemDetails(model: ModelJson, radiator: RadiatorJson): string {
	const dimensions =
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
	const shoppingCart = useStore(storeShoppingCart)
	const getTotalCost = useStore(getRadiatorTotalCost)
	const getTotalTitle = useStore(radiatorTotalTitle)

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

		shouldScrollToVariants.current = hasValidContextFilter
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
				document.getElementById('model-variants')?.scrollIntoView({ block: 'start' })
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
						title={model.type === 'convector' ? 'Глубина (мм)' : 'Глубина'}
						options={widths}
						availableOptions={availableWidths}
						selectedOption={selectedWidth}
						setSelectedOption={changeWidthFilter}
						showAllOption
					/>
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
										<tr class='border-b border-neutral-200 text-xs font-normal text-neutral-800 transition hover:bg-neutral-50 last:border-b-0'>
											<td class='px-2.5 py-2.5'>
												<div class='font-normal text-neutral-900'>
													{totalTitle}
												</div>
											</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.height} мм</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.n_spacing ? `${radiator.n_spacing} мм` : '—'}</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.length} мм</td>
											<td class='px-2.5 py-2.5 text-center'>{getPowerValue(radiator)} Вт</td>
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
								<article class='rounded-[3px] border border-neutral-200 bg-white p-2.5'>
									<div class='text-xs font-normal leading-5 text-neutral-950'>
										{totalTitle}
									</div>
									<div class='mt-1 text-xs leading-5 text-neutral-700'>
										Высота: {radiator.height} мм · М/о: {radiator.n_spacing || '—'} мм · Длина: {radiator.length} мм · Мощность: {getPowerValue(radiator)} Вт
									</div>
									<div class='mt-2 flex items-center justify-between gap-3'>
										<div class='text-base font-semibold text-neutral-950'>
											от {totalPrice.toLocaleString('ru-RU')} ₽
										</div>
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
