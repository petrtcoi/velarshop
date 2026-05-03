import { addToCart, removeFromCart, storeShoppingCart } from '@features/order/ShoppingCart'
import { useStore } from '@nanostores/preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

type ModelType = 'design' | 'floor' | 'convector' | 'ironcast' | 'columns'
type Orientation = 'vertical' | 'horizontal' | ''

type ModelOption = {
	id: string
	slug: string
	name: string
	type: ModelType
	orientation?: Orientation
	prefix: string
	search: string
	href: string
}

type SelectOption = {
	id: string
	label: string
	code?: string
	priceRub?: number
	multiplicate?: number
	priceId?: string
}

type Variant = {
	slug: string
	title: string
	height: string
	width: string
	length: string
	sections?: string
	nSpacing?: string
	dt70?: string
	price: string
	addonDesignRadiatorsLegs?: string
	grillPrices?: Record<string, string | undefined>
}

type ModelDetails = {
	model: ModelOption
	filters: {
		height: boolean
		width: boolean
		length: boolean
		sections: boolean
		tubes: boolean
		connection: boolean
		color: boolean
		grill: boolean
		addon: boolean
	}
	options: {
		heights: string[]
		widths: string[]
		lengths: string[]
		sections: string[]
		tubes: string[]
		connections: SelectOption[]
		colors: SelectOption[]
		grills: SelectOption[]
		addon?: SelectOption
	}
	variants: Variant[]
}

type Props = {
	models: ModelOption[]
	defaultModelId?: string
}

type InlineSelectOption = {
	value: string
	label: string
	disabled?: boolean
}

type DimensionKey = 'height' | 'width' | 'length' | 'sections' | 'tubes'
type Selection = Record<DimensionKey, string> & {
	connection: string
	color: string
	grill: string
	addon: boolean
}

const emptySelection: Selection = {
	height: '',
	width: '',
	length: '',
	sections: '',
	tubes: '',
	connection: '',
	color: '',
	grill: '',
	addon: false,
}

function formatRub(value: number): string {
	return `${value.toLocaleString('ru-RU')} ₽`
}

function parsePrice(value: string | undefined): number {
	if (!value) return 0
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) ? parsed : 0
}

function fieldLabelClass(): string {
	return 'text-[10px] font-thin uppercase  tracking-tight text-neutral-600'
}

function modelTypeLabel(model: Pick<ModelOption, 'type' | 'orientation'>): string {
	if (model.type === 'columns') return 'Трубчатый радиатор'
	if (model.type === 'convector') return 'Конвектор'
	if (model.type === 'floor') return 'Напольный радиатор'
	if (model.type === 'ironcast') return 'Ретро-радиатор'
	return model.orientation === 'horizontal' ? 'Горизонтальный дизайн' : 'Вертикальный дизайн'
}

function getVariantDimension(variant: Variant, key: DimensionKey, model?: ModelOption): string {
	if (key === 'tubes') return model?.type === 'columns' ? model.id.slice(0, 1) : ''
	return variant[key] ?? ''
}

function getDimensionOptions(details: ModelDetails, key: DimensionKey): string[] {
	if (key === 'height') return details.options.heights
	if (key === 'width') return details.options.widths
	if (key === 'length') return details.options.lengths
	if (key === 'sections') return details.options.sections
	return details.options.tubes
}

function optionLabel(key: DimensionKey, value: string): string {
	if (key === 'height' || key === 'width' || key === 'length') return `${value} мм`
	if (key === 'sections') return `${value} сек.`
	if (key === 'tubes') return `${value} трубки`
	return value
}

function isVariantMatch(variant: Variant, details: ModelDetails, selection: Selection): boolean {
	return (['height', 'width', 'length', 'sections', 'tubes'] as DimensionKey[]).every(key => {
		if (!details.filters[key]) return true
		const selected = selection[key]
		if (!selected) return true
		return getVariantDimension(variant, key, details.model) === selected
	})
}

function getAvailableOptions(details: ModelDetails, selection: Selection, key: DimensionKey): string[] {
	const source = getDimensionOptions(details, key)

	return source.filter(value =>
		details.variants.some(variant =>
			(['height', 'width', 'length', 'sections', 'tubes'] as DimensionKey[]).every(candidateKey => {
				if (!details.filters[candidateKey]) return true
				const selected = candidateKey === key ? value : selection[candidateKey]
				if (!selected) return true
				return getVariantDimension(variant, candidateKey, details.model) === selected
			}),
		),
	)
}

function buildInitialSelection(details: ModelDetails): Selection {
	return {
		height: details.filters.height ? details.options.heights[0] ?? '' : '',
		width: details.filters.width ? details.options.widths[0] ?? '' : '',
		length: details.filters.length ? details.options.lengths[0] ?? '' : '',
		sections: details.filters.sections ? details.options.sections[0] ?? '' : '',
		tubes: details.filters.tubes ? details.options.tubes[0] ?? '' : '',
		connection: details.options.connections[0]?.id ?? '',
		color: details.options.colors[0]?.id ?? '',
		grill: details.options.grills[0]?.id ?? '',
		addon: false,
	}
}

function getSelectionSummary(details: ModelDetails, variant: Variant, selection: Selection): string {
	const parts = [
		details.filters.height ? `высота ${variant.height} мм` : '',
		details.filters.length ? `длина ${variant.length} мм` : '',
		details.filters.width ? `${details.model.type === 'convector' ? 'ширина' : 'глубина'} ${variant.width} мм` : '',
		details.filters.sections && variant.sections ? `${variant.sections} сек.` : '',
		details.filters.tubes ? `${selection.tubes} трубки` : '',
		details.options.connections.find(item => item.id === selection.connection)?.code ?? '',
		details.options.colors.find(item => item.id === selection.color)?.label ?? '',
		details.options.grills.find(item => item.id === selection.grill)?.code ?? '',
		selection.addon ? details.options.addon?.code ?? details.options.addon?.label ?? '' : '',
	]

	return parts.filter(Boolean).join(' / ')
}

function InlineSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string
	value: string
	options: InlineSelectOption[]
	onChange: (value: string) => void
}) {
	const [open, setOpen] = useState(false)
	const selectRef = useRef<HTMLDivElement>(null)
	const selectedOption = options.find(option => option.value === value)

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!selectRef.current?.contains(event.target as Node)) setOpen(false)
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		window.addEventListener('pointerdown', handlePointerDown)
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('pointerdown', handlePointerDown)
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	return (
		<div
			class='relative min-w-0'
			ref={selectRef}
		>
			<label class={fieldLabelClass()}>{label}</label>
			<button
				type='button'
				class={`mt-0 flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-neutral-50 px-2 text-left text-[13px] text-neutral-950 outline-none transition hover:border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
					open ? 'border-red-500 ring-2 ring-red-100' : 'border-neutral-200'
				}`}
				aria-haspopup='listbox'
				aria-expanded={open}
				onClick={() => setOpen(current => !current)}
			>
				<span class='min-w-0 truncate'>{selectedOption?.label ?? 'Выберите'}</span>
				<span
					class='shrink-0 text-neutral-400'
					aria-hidden='true'
				>
					⌄
				</span>
			</button>

			{open && (
				<div class='absolute left-0 right-0 top-[calc(100%+4px)] z-40 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.22)]'>
					<div
						role='listbox'
						class='max-h-[220px] overflow-y-auto p-1 md:max-h-[280px]'
					>
						{options.map(option => {
							const selected = option.value === value
							return (
								<button
									type='button'
									role='option'
									aria-selected={selected}
									disabled={option.disabled}
									class={`block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition hover:bg-red-50 md:px-3 md:py-2 ${
										selected ? 'bg-red-50 text-red-700' : 'text-neutral-900'
									} ${option.disabled ? 'cursor-not-allowed opacity-35 hover:bg-transparent' : ''}`}
									onClick={() => {
										if (option.disabled) return
										onChange(option.value)
										setOpen(false)
									}}
								>
									<span class='block truncate'>{option.label}</span>
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}

function getTotalPrice(details: ModelDetails, variant: Variant, selection: Selection): number {
	let price = parsePrice(variant.price)

	const color = details.options.colors.find(item => item.id === selection.color)
	if (details.model.type === 'columns' && color?.multiplicate) price *= color.multiplicate

	const connection = details.options.connections.find(item => item.id === selection.connection)
	price += connection?.priceRub ?? 0

	const grill = details.options.grills.find(item => item.id === selection.grill)
	if (grill?.priceId && grill.priceId !== 'grill_empty') {
		price += parsePrice(variant.grillPrices?.[grill.priceId])
	}

	if (selection.addon && details.options.addon?.id === 'addon_design_radiators_legs') {
		price += parsePrice(variant.addonDesignRadiatorsLegs)
	}

	return Math.max(0, Math.round(price))
}

export default function HeroQuickConfigurator({ models, defaultModelId = '3030' }: Props) {
	const shoppingCart = useStore(storeShoppingCart)
	const [selectedModelId, setSelectedModelId] = useState(defaultModelId)
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const [details, setDetails] = useState<ModelDetails | null>(null)
	const [selection, setSelection] = useState<Selection>(emptySelection)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const comboboxRef = useRef<HTMLDivElement>(null)
	const modelSearchInputRef = useRef<HTMLInputElement>(null)

	const selectedModel = useMemo(
		() => models.find(model => model.id === selectedModelId) ?? models[0],
		[models, selectedModelId],
	)

	const filteredModels = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase()
		if (!normalizedQuery) return models.slice(0, 12)
		return models.filter(model => model.search.includes(normalizedQuery)).slice(0, 18)
	}, [models, query])

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!comboboxRef.current?.contains(event.target as Node)) setOpen(false)
		}
		window.addEventListener('pointerdown', handlePointerDown)
		return () => window.removeEventListener('pointerdown', handlePointerDown)
	}, [])

	useEffect(() => {
		if (!open) return
		const rafId = window.requestAnimationFrame(() => {
			modelSearchInputRef.current?.focus()
		})
		return () => window.cancelAnimationFrame(rafId)
	}, [open])

	useEffect(() => {
		if (!selectedModelId) return
		const controller = new AbortController()

		setLoading(true)
		setError('')
		fetch(`/api/hero-configurator/${encodeURIComponent(selectedModelId)}.json`, {
			signal: controller.signal,
		})
			.then(response => {
				if (!response.ok) throw new Error('Не удалось загрузить модель')
				return response.json() as Promise<ModelDetails>
			})
			.then(payload => {
				setDetails(payload)
				setSelection(buildInitialSelection(payload))
			})
			.catch(fetchError => {
				if (fetchError.name === 'AbortError') return
				setError('Не удалось загрузить варианты. Попробуйте выбрать модель еще раз.')
			})
			.finally(() => setLoading(false))

		return () => controller.abort()
	}, [selectedModelId])

	const matchedVariants = useMemo(() => {
		if (!details) return []
		return details.variants.filter(variant => isVariantMatch(variant, details, selection))
	}, [details, selection])

	useEffect(() => {
		if (!details || matchedVariants.length > 0) return
		const fallback = details.variants.find(variant =>
			(['height', 'width', 'length', 'sections', 'tubes'] as DimensionKey[]).every(key => {
				if (!details.filters[key]) return true
				const selected = selection[key]
				if (!selected) return true
				return getVariantDimension(variant, key, details.model) === selected
			}),
		)
		if (!fallback) return
		setSelection(current => ({
			...current,
			height: details.filters.height ? fallback.height : current.height,
			width: details.filters.width ? fallback.width : current.width,
			length: details.filters.length ? fallback.length : current.length,
			sections: details.filters.sections ? fallback.sections ?? current.sections : current.sections,
			tubes: details.filters.tubes ? getVariantDimension(fallback, 'tubes', details.model) : current.tubes,
		}))
	}, [details, matchedVariants.length, selection])

	const result = matchedVariants[0]
	const totalPrice = details && result ? getTotalPrice(details, result, selection) : 0
	const summary = details && result ? getSelectionSummary(details, result, selection) : ''
	const itemTitle = details && result ? `${result.title}${summary ? `, ${summary}` : ''}` : ''
	const itemInCartQnty = shoppingCart.items.find(item => item.title === itemTitle)?.qnty ?? 0

	const setDimension = (key: DimensionKey, value: string) => {
		setSelection(current => ({ ...current, [key]: value }))
	}

	const handleAddToCart = () => {
		if (!details || !result || !totalPrice) return
		addToCart({
			title: itemTitle,
			price: totalPrice,
			details: `${result.height}x${result.length}x${result.width} мм${result.dt70 ? ` / ${result.dt70} Вт` : ''}`,
			linkSlug: `/model/${details.model.slug}/${result.slug}`,
			itemType: 'radiator',
		})
	}

	const handleRemoveFromCart = () => {
		if (!itemTitle) return
		removeFromCart({ title: itemTitle })
	}

	return (
		<div class='w-full max-w-[460px] rounded-[20px] border border-white/70 bg-white p-3.5 text-neutral-950 shadow-[0_24px_64px_rgba(0,0,0,0.28)] md:rounded-[22px] md:p-5 md:shadow-[0_28px_80px_rgba(0,0,0,0.30)]'>
			<div class='flex items-start justify-between gap-3 md:gap-4'>
				<div>
					<h2 class='text-md font-semibold tracking-tight md:text-lg'>Быстрый выбор</h2>
					{/* <p class='mt-0.5 text-xs leading-4 text-neutral-600  font-light  md:leading-tight'>
						Модель, параметры и корзина без перехода в каталог
					</p> */}
				</div>
				<a
					href='/cart'
					class='shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-red-200 hover:text-red-700 md:px-3 md:py-1.5'
				>
					Корзина
				</a>
			</div>

			<div
				class='mt-2'
				ref={comboboxRef}
			>
				<label
					class={fieldLabelClass()}
					id='hero_model_label'
				>
					модель
				</label>
				<div class='relative mt-0'>
					<button
						type='button'
						class='flex h-8 w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-left text-[13px] outline-none transition hover:border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 '
						aria-haspopup='listbox'
						aria-expanded={open}
						aria-labelledby='hero_model_label'
						onClick={() => {
							setOpen(value => !value)
							setQuery('')
						}}
					>
						<span class='min-w-0 truncate'>{selectedModel ? `Velar ${selectedModel.name}` : 'Выберите модель'}</span>
						<span
							class='ml-3 text-neutral-400'
							aria-hidden='true'
						>
							⌄
						</span>
					</button>

					{open && (
						<div class='absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl md:top-[calc(100%+6px)]'>
							<div class='border-b border-neutral-100 p-1.5 md:p-2'>
								<input
									ref={modelSearchInputRef}
									class='h-9 w-full rounded-lg border border-neutral-200 px-2.5 text-[13px] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 md:h-10 md:px-3 md:text-sm'
									value={query}
									placeholder='P30, P60, Q40, 3030, KWH...'
									onInput={event => setQuery((event.currentTarget as HTMLInputElement).value)}
								/>
							</div>
							<div
								role='listbox'
								class='max-h-[220px] overflow-y-auto p-1 md:max-h-[280px]'
							>
								{filteredModels.length === 0 ? (
									<div class='px-3 py-3 text-[13px] text-neutral-500 md:py-4 md:text-sm'>Модель не найдена</div>
								) : (
									filteredModels.map(model => (
										<button
											type='button'
											role='option'
											aria-selected={model.id === selectedModelId}
											class={`block w-full rounded-lg px-2.5 py-1.5 text-left transition hover:bg-red-50 md:px-3 md:py-2 ${
												model.id === selectedModelId ? 'bg-red-50 text-red-700' : 'text-neutral-900'
											}`}
											onClick={() => {
												setSelectedModelId(model.id)
												setOpen(false)
												setQuery('')
											}}
										>
											<span class='block text-[13px] font-medium md:text-sm'>Velar {model.name}</span>
											<span class='block text-[11px] text-neutral-500 md:mt-0.5 md:text-xs'>
												{modelTypeLabel(model)} · {model.id}
											</span>
										</button>
									))
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{loading && (
				<div class='mt-3 rounded-xl bg-neutral-50 p-3 text-[13px] text-neutral-600 md:mt-4 md:p-4 md:text-sm'>
					Загружаем доступные параметры...
				</div>
			)}
			{error && (
				<div class='mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[13px] text-red-700 md:mt-4 md:p-4 md:text-sm'>
					{error}
				</div>
			)}

			{details && !loading && (
				<div class='mt-3 space-y-2.5 md:mt-4 md:space-y-3'>
					<div class='grid grid-cols-2 gap-2 md:gap-2.5'>
						{(['tubes', 'height', 'sections', 'length', 'width'] as DimensionKey[]).map(key => {
							if (!details.filters[key]) return null
							const available = getAvailableOptions(details, selection, key)
							const options = getDimensionOptions(details, key)
							const titleByKey: Record<DimensionKey, string> = {
								tubes: 'Трубок',
								height: 'Высота',
								sections: 'Секций',
								length: 'Длина',
								width: details.model.type === 'convector' ? 'Ширина' : 'Глубина',
							}

							return (
								<InlineSelect
									label={titleByKey[key]}
									value={selection[key]}
									options={options.map(value => ({
										value,
										label: optionLabel(key, value),
										disabled: !available.includes(value),
									}))}
									onChange={value => setDimension(key, value)}
								/>
							)
						})}

						{details.filters.connection && details.options.connections.length > 0 && (
							<InlineSelect
								label='Подключение'
								value={selection.connection}
								options={details.options.connections.map(option => ({ value: option.id, label: option.label }))}
								onChange={value => setSelection(current => ({ ...current, connection: value }))}
							/>
						)}

						{details.filters.color && details.options.colors.length > 0 && (
							<InlineSelect
								label='Цвет'
								value={selection.color}
								options={details.options.colors.map(option => ({ value: option.id, label: option.label }))}
								onChange={value => setSelection(current => ({ ...current, color: value }))}
							/>
						)}

						{details.filters.grill && details.options.grills.length > 0 && (
							<InlineSelect
								label='Решетка'
								value={selection.grill}
								options={details.options.grills.map(option => ({ value: option.id, label: option.label }))}
								onChange={value => setSelection(current => ({ ...current, grill: value }))}
							/>
						)}
					</div>

					{details.filters.addon && details.options.addon && (
						<label class='flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-[13px] text-neutral-800 md:px-3 md:text-sm'>
							<input
								type='checkbox'
								checked={selection.addon}
								onChange={() => setSelection(current => ({ ...current, addon: !current.addon }))}
							/>
							{details.options.addon.label}
						</label>
					)}

					{result ? (
						<div class='rounded-xl border border-neutral-200 bg-neutral-50 p-3 md:rounded-2xl md:p-3.5'>
							<div class='text-[10px] font-thin uppercase tracking-tight text-neutral-500'>Найденный вариант</div>
							<a
								href={`/model/${details.model.slug}`}
								class='mt-1 block text-[15px] font-semibold leading-5 text-neutral-950 hover:text-red-700 md:text-base'
							>
								{result.title}
							</a>
							<div class='mt-1 text-[11px] text-neutral-500 md:mt-0.5 md:text-xs leading-tight'>{summary}</div>
							<div class='mt-2.5 flex items-end justify-between gap-2.5 md:mt-3 md:gap-3'>
								<div>
									{totalPrice > 0 && (
										<div class='text-[22px] font-semibold leading-none tracking-[-0.03em] md:text-2xl'>
											{formatRub(totalPrice)}
										</div>
									)}
									{result.dt70 && (
										<div class='mt-1 text-[11px] text-neutral-500 md:mt-0.5 md:text-xs'>
											Мощность ΔT70: {result.dt70} Вт
										</div>
									)}
								</div>
								{matchedVariants.length > 1 && (
									<a
										href={details.model.href}
										class='text-right text-[11px] font-medium leading-4 text-red-700 hover:underline md:text-xs'
									>
										Еще {matchedVariants.length - 1} вариантов
									</a>
								)}
							</div>

							<div class='mt-2.5 flex flex-wrap items-center gap-2 md:mt-3'>
								{itemInCartQnty > 0 ? (
									<>
										<button
											type='button'
											class='h-10 w-10 rounded-lg border border-neutral-300 bg-white text-lg transition hover:border-red-300 hover:text-red-700'
											onClick={handleRemoveFromCart}
											aria-label='Уменьшить количество'
										>
											-
										</button>
										<div class='min-w-8 text-center text-sm font-semibold'>{itemInCartQnty}</div>
										<button
											type='button'
											class='h-10 w-10 rounded-lg border border-neutral-300 bg-white text-lg transition hover:border-red-300 hover:text-red-700'
											onClick={handleAddToCart}
											aria-label='Увеличить количество'
										>
											+
										</button>
										<span class='text-sm font-medium text-green-700'>Добавлено</span>
									</>
								) : (
									<button
										type='button'
										class='h-10 flex-1 rounded-lg bg-red-700 px-4 text-[13px] font-sm text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-neutral-300 md:text-sm'
										disabled={!totalPrice}
										onClick={handleAddToCart}
									>
										Добавить в корзину
									</button>
								)}
							</div>

							<div class='mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[13px] md:mt-3 md:gap-x-4 md:gap-y-2 md:text-sm'>
								<a
									href={details.model.href}
									class='font-medium text-neutral-700 hover:text-red-700 hover:underline'
								>
									Подробнее о модели
								</a>
								<a
									href='/cart'
									class='font-medium text-red-700 hover:underline'
								>
									Перейти в корзину
								</a>
							</div>
						</div>
					) : (
						<div class='rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[13px] text-neutral-600 md:p-4 md:text-sm'>
							Для выбранных параметров нет варианта. Измените один из размеров.
						</div>
					)}
				</div>
			)}
		</div>
	)
}
