import { useStore } from '@nanostores/preact'
import { useEffect, useState } from 'preact/hooks'

import RadiatorFilter from './RadiatorFilter'
import RadiatorListHeader from './RadiatorListHeader'
import RadiatorRow from './RadiatorRow'

import SelectAddon from '@features/options/SelectAddons'
import SelectConvectorGrill from '@features/options/SelectConvectorGrill'
import { addToCart, storeShoppingCart } from '@features/order/ShoppingCart'
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

function normalizeModelName(name: string): string {
	return name
		.replace(/([A-Za-zА-Яа-я])\s+(\d+)/g, '$1$2')
		.replace(/\s+/g, ' ')
		.trim()
}

function getRadiatorPrice(radiator: RadiatorJson): number {
	return Number.parseInt(radiator.price, 10) || 0
}

function getCartItemTitle(modelLabel: string, model: ModelJson, radiator: RadiatorJson): string {
	return `${modelLabel} ${getSizeLabel(model, radiator)}`
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
		filterByHeight = false,
		filterByWidth = false,
		filterByLength = false,
	} = props

	const [lastFilterUpdate, setLastFilterUpdate] = useState<'length' | 'height' | 'width'>('height')
	const [selectedHeight, setSelectedHeight] = useState<string>(filterByHeight ? heights[0] : ALL)
	const [selectedWidth, setSelectedWidth] = useState<string>(filterByWidth ? widths[0] : ALL)
	const [selectedLength, setSelectedLength] = useState<string>(filterByLength ? lengths[0] : ALL)
	const [filteredRadiators, setFilteredRadiators] = useState<RadiatorJson[]>(initialFilteredRadiators)
	const shoppingCart = useStore(storeShoppingCart)

	const changeHeightFilter = (height: string) => {
		setSelectedHeight(height)
		setLastFilterUpdate('height')
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
		const radiator = radiators.find(
			r =>
				(selectedHeight === ALL || r.height === selectedHeight) &&
				(selectedWidth === ALL || r.width === selectedWidth) &&
				(selectedLength === ALL || r.length === selectedLength),
		)
		if (radiator) return

		const escapeRadiator = radiators.find(
			r =>
				(selectedHeight === ALL || lastFilterUpdate !== 'height' || r.height === selectedHeight) &&
				(selectedWidth === ALL || lastFilterUpdate !== 'width' || r.width === selectedWidth) &&
				(selectedLength === ALL || lastFilterUpdate !== 'length' || r.length === selectedLength),
		)

		if (escapeRadiator) {
			if (lastFilterUpdate !== 'height' && selectedHeight !== ALL) setSelectedHeight(escapeRadiator.height)
			if (lastFilterUpdate !== 'width' && selectedWidth !== ALL) setSelectedWidth(escapeRadiator.width)
			if (lastFilterUpdate !== 'length' && selectedLength !== ALL) setSelectedLength(escapeRadiator.length)
		}
	}, [filteredRadiators])

	const [availableHeights, setAvailableHeights] = useState<string[]>(heights)
	const [availableWidths, setAvailableWidths] = useState<string[]>(widths)
	const [availableLengths, setAvailableLengths] = useState<string[]>(lengths)

	useEffect(() => {
		setAvailableHeights(
			heights.filter(h =>
				radiators.some(
					r =>
						lastFilterUpdate === 'height' ||
						selectedHeight === ALL ||
						(h === r.height &&
							(selectedWidth === ALL || r.width === selectedWidth) &&
							(selectedLength === ALL || r.length === selectedLength)),
				),
			),
		)
		setAvailableWidths(
			widths.filter(w =>
				radiators.some(
					r =>
						lastFilterUpdate === 'width' ||
						selectedWidth === ALL ||
						(w === r.width &&
							(selectedHeight === ALL || r.height === selectedHeight) &&
							(selectedLength === ALL || r.length === selectedLength)),
				),
			),
		)
		setAvailableLengths(
			lengths.filter(l =>
				radiators.some(
					r =>
						lastFilterUpdate === 'length' ||
						selectedLength === ALL ||
						(l === r.length &&
							(selectedHeight === ALL || r.height === selectedHeight) &&
							(selectedWidth === ALL || r.width === selectedWidth)),
				),
			),
		)
	}, [filteredRadiators])

	useEffect(() => {
		setFilteredRadiators(
			filterRadiators({
				radiators,
				selectedHeight,
				selectedLength,
				selectedWidth,
			}),
		)
	}, [selectedHeight, selectedWidth, selectedLength])

	const modelLabel = `Velar ${normalizeModelName(model.name)}`
	const showInterAxis = model.type !== 'convector' && model.type !== 'floor'

	const addRadiatorToRequest = (radiator: RadiatorJson) => {
		addToCart({
			title: getCartItemTitle(modelLabel, model, radiator),
			price: getRadiatorPrice(radiator),
			details: getCartItemDetails(model, radiator),
			linkSlug: `/model/${model.slug}`,
			itemType: 'radiator',
		})
	}

	const getRadiatorQnty = (radiator: RadiatorJson) => {
		const itemTitle = getCartItemTitle(modelLabel, model, radiator)
		return shoppingCart.items.find(item => item.title === itemTitle)?.qnty || 0
	}

	return (
		<div
			id='radiators-list'
			class='mt-5'
		>
			<div>
				{filterByLength && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Длина (мм)' : 'Длина'}
						options={lengths}
						availableOptions={availableLengths}
						selectedOption={selectedLength}
						setSelectedOption={changeLengthFilter}
					/>
				)}
				{filterByHeight && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Высота (мм)' : 'Высота'}
						options={heights}
						availableOptions={availableHeights}
						selectedOption={selectedHeight}
						setSelectedOption={changeHeightFilter}
					/>
				)}
				{filterByWidth && (
					<RadiatorFilter
						title={model.type === 'convector' ? 'Глубина (мм)' : 'Глубина'}
						options={widths}
						availableOptions={availableWidths}
						selectedOption={selectedWidth}
						setSelectedOption={changeWidthFilter}
					/>
				)}

				{model.type === 'convector' && (
					<>
						<SelectConvectorGrill />
						<SelectAddon model={model} />

						<div class='mt-5 overflow-x-auto'>
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
					</>
				)}

				{model.type !== 'convector' && (
					<div class='mt-4 hidden overflow-x-auto border border-neutral-200 md:block'>
						<table class='w-full min-w-[720px] border-collapse text-left text-xs font-normal'>
							<thead>
								<tr class='border-b border-neutral-200 bg-neutral-100 text-xs font-normal uppercase tracking-[0.04em] text-neutral-600'>
									<th class='px-2.5 py-2 font-normal'>Модель / размер</th>
									<th class='px-2.5 py-2 text-center font-normal'>Высота</th>
									<th class='px-2.5 py-2 text-center font-normal'>Длина</th>
									<th class='px-2.5 py-2 text-center font-normal'>Мощность</th>
									<th class='px-2.5 py-2 text-right font-normal'>Цена</th>
									<th class='px-2.5 py-2 text-right font-normal'>Действие</th>
								</tr>
							</thead>
							<tbody>
								{filteredRadiators.map(radiator => {
									const qnty = getRadiatorQnty(radiator)
									return (
										<tr class='border-b border-neutral-200 text-xs font-normal text-neutral-800 transition hover:bg-neutral-50 last:border-b-0'>
											<td class='px-2.5 py-2.5'>
												<div class='font-normal text-neutral-900'>
													{modelLabel} {getSizeLabel(model, radiator)}
												</div>
											</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.height} мм</td>
											<td class='px-2.5 py-2.5 text-center'>{radiator.length} мм</td>
											<td class='px-2.5 py-2.5 text-center'>{getPowerValue(radiator)} Вт</td>
											<td class='px-2.5 py-2.5 text-right font-normal'>
												{getRadiatorPrice(radiator).toLocaleString('ru-RU')} ₽
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
							return (
								<article class='rounded-[3px] border border-neutral-200 bg-white p-2.5'>
									<div class='text-xs font-normal leading-5 text-neutral-950'>
										{modelLabel} {getSizeLabel(model, radiator)}
									</div>
									<div class='mt-1 text-xs leading-5 text-neutral-700'>
										Высота: {radiator.height} мм · Длина: {radiator.length} мм · Мощность: {getPowerValue(radiator)} Вт
									</div>
									<div class='mt-2 flex items-center justify-between gap-3'>
										<div class='text-xs font-normal text-neutral-950'>
											от {getRadiatorPrice(radiator).toLocaleString('ru-RU')} ₽
										</div>
										<button
											type='button'
											onClick={() => addRadiatorToRequest(radiator)}
											class='inline-flex h-7 shrink-0 items-center justify-center rounded-[3px] border border-red-200 bg-white px-2.5 text-xs font-normal text-red-700 transition hover:border-red-700 hover:bg-red-50'
										>
											{qnty > 0 ? `В корзине: ${qnty}` : 'В корзину'}
										</button>
									</div>
								</article>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

export default RadiatorList
