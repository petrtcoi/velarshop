import { addToCart, removeFromCart, storeShoppingCart } from '@features/order/ShoppingCart'
import { useStore } from '@nanostores/preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

type ModelType = 'design' | 'floor' | 'convector' | 'ironcast' | 'columns'
type Orientation = 'vertical' | 'horizontal' | ''
type ModelResolutionMode = 'exact-model' | 'family-by-height'
type ConfiguratorCategory = 'tubular' | 'retro'

export type ModelOption = {
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
	pricePerSectionRub?: number
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
	initialDetails?: ModelDetails | null
	variant?: 'hero' | 'modal' | 'category'
	title?: string
	modelResolutionMode?: ModelResolutionMode
	category?: ConfiguratorCategory
	onNavigate?: () => void
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
	return 'mb-1.5 block text-[10px] font-thin uppercase tracking-tight text-neutral-600'
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

function getColumnTubeModelId(models: ModelOption[], currentModelId: string, tubes: string): string | undefined {
	const suffix = currentModelId.slice(1)
	return models.find(model => model.type === 'columns' && model.id === `${tubes}${suffix}`)?.id
}

function getModelHeight(model: ModelOption): string | undefined {
	if (model.type === 'columns') {
		const heightFromDescription = model.search.match(/высот\D+(\d+)/i)?.[1]
		if (heightFromDescription) return heightFromDescription

		const suffix = model.id.slice(1)
		const height = Number.parseInt(suffix, 10) * 10
		return Number.isFinite(height) ? String(height) : undefined
	}

	if (model.type === 'ironcast') {
		const match = model.id.match(/(300|500)$/)
		return match?.[1]
	}

	return undefined
}

function getFamilyKey(model: ModelOption): string {
	if (model.type === 'columns') return `columns:${model.id.slice(0, 1)}`
	if (model.type === 'ironcast') return `ironcast:${model.id.replace(/(300|500)$/, '')}`
	return `${model.type}:${model.id}`
}

function getFamilyModelsByHeight(models: ModelOption[], currentModel: ModelOption): ModelOption[] {
	const familyKey = getFamilyKey(currentModel)
	return models
		.filter(model => getFamilyKey(model) === familyKey && getModelHeight(model))
		.sort((a, b) => Number(getModelHeight(a) ?? 0) - Number(getModelHeight(b) ?? 0))
}

function getFamilyHeightOptions(models: ModelOption[], currentModel: ModelOption): string[] {
	return [...new Set(getFamilyModelsByHeight(models, currentModel).map(model => getModelHeight(model)).filter(Boolean) as string[])]
}

function getFamilyModelIdByHeight(models: ModelOption[], currentModel: ModelOption, height: string): string | undefined {
	return getFamilyModelsByHeight(models, currentModel).find(model => getModelHeight(model) === height)?.id
}

function optionLabel(key: DimensionKey, value: string): string {
	if (key === 'height' || key === 'width' || key === 'length') return `${value} мм`
	if (key === 'sections') return `${value} сек.`
	if (key === 'tubes') return `${value} ${value === '2' || value === '3' || value === '4' ? 'трубки' : 'труб'}`
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

function getVariantSizeLabel(variant: Variant): string {
	return [variant.height, variant.length, variant.width].filter(Boolean).join(' × ')
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
				class={`mt-0 flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-neutral-50 px-2.5 text-left text-[13px] text-neutral-950 outline-none transition hover:border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
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
	if (details.model.type === 'ironcast' && color?.pricePerSectionRub) {
		price += color.pricePerSectionRub * parsePrice(variant.sections)
	}

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

export type { ModelDetails }

export default function HeroQuickConfigurator({
	models,
	defaultModelId = '3030',
	initialDetails = null,
	variant = 'hero',
	title,
	modelResolutionMode = 'exact-model',
	onNavigate,
}: Props) {
	const shoppingCart = useStore(storeShoppingCart)
	const [selectedModelId, setSelectedModelId] = useState(defaultModelId)
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const [details, setDetails] = useState<ModelDetails | null>(initialDetails)
	const [selection, setSelection] = useState<Selection>(() => (initialDetails ? buildInitialSelection(initialDetails) : emptySelection))
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const comboboxRef = useRef<HTMLDivElement>(null)
	const modelSearchInputRef = useRef<HTMLInputElement>(null)
	const skipInitialFetchRef = useRef(Boolean(initialDetails))

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
		setSelectedModelId(defaultModelId)
	}, [defaultModelId])

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

		if (skipInitialFetchRef.current && initialDetails?.model.id === selectedModelId) {
			skipInitialFetchRef.current = false
			return
		}
		skipInitialFetchRef.current = false

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
	const sizeLabel = result ? getVariantSizeLabel(result) : ''
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
			linkSlug: details.model.type === 'columns' ? details.model.href : `/model/${details.model.slug}/${result.slug}`,
			itemType: 'radiator',
		})
	}

	const handleRemoveFromCart = () => {
		if (!itemTitle) return
		removeFromCart({ title: itemTitle })
	}

	const isModal = variant === 'modal'
	const isCategory = variant === 'category'
	const useFamilyByHeight = modelResolutionMode === 'family-by-height'
	const isFloorModel = details?.model.type === 'floor'
	const titleClass = isModal ? 'text-md font-semibold tracking-tight' : 'text-md font-semibold tracking-tight md:text-lg'
	const contentSpacingClass = isModal ? 'mt-3.5 space-y-2.5' : 'mt-3.5 space-y-3 md:mt-4 md:space-y-3'
	const gridGapClass = isFloorModel
		? isModal
			? 'grid grid-cols-1 gap-x-2 gap-y-2.5'
			: 'grid grid-cols-1 gap-x-2.5 gap-y-3 md:grid-cols-2 md:gap-2.5'
		: isModal
			? 'grid grid-cols-2 gap-x-2 gap-y-2.5'
			: 'grid grid-cols-2 gap-x-2.5 gap-y-3 md:gap-2.5'
	const configuratorTitle = title ?? (isCategory ? 'Быстрый подбор' : 'Быстрый выбор')

	return (
		<div
			class={`w-full text-neutral-950 ${
				isModal
					? 'rounded-none border-0 bg-transparent p-0 shadow-none'
					: isCategory
						? 'rounded-[20px] border border-neutral-200 bg-white p-4 shadow-none transition hover:border-neutral-300 md:p-5'
					: 'max-w-[460px] rounded-[20px] border border-white/70 bg-white px-[18px] pb-4 pt-[18px] shadow-[0_24px_64px_rgba(0,0,0,0.28)] md:rounded-[22px] md:p-5 md:shadow-[0_28px_80px_rgba(0,0,0,0.30)]'
			}`}
		>
			<div class='mb-3.5 flex items-start justify-between gap-3 md:mb-4 md:gap-4'>
				<div>
					<h2 class={titleClass}>{configuratorTitle}</h2>
					{/* <p class='mt-0.5 text-xs leading-4 text-neutral-600  font-light  md:leading-tight'>
						Модель, параметры и корзина без перехода в каталог
					</p> */}
				</div>
				{!isModal && (
					<a
						href='/cart'
						class='shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-red-200 hover:text-red-700 md:px-3 md:py-1.5'
					>
						Корзина
					</a>
				)}
			</div>

			<div
				class='mt-0'
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
						class='flex h-11 w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-left text-[13px] outline-none transition hover:border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 '
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

			{loading && !details && (
				<div class='mt-3 rounded-xl bg-neutral-50 p-3 text-[13px] text-neutral-600 md:mt-4 md:p-4 md:text-sm'>
					Загружаем доступные параметры...
				</div>
			)}
			{error && (
				<div class='mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[13px] text-red-700 md:mt-4 md:p-4 md:text-sm'>
					{error}
				</div>
			)}

			{details && (
				<div class={`relative ${contentSpacingClass} transition-opacity duration-200 ${
					loading ? 'pointer-events-none select-none opacity-45' : 'opacity-100'
				}`}>
					<div class={gridGapClass}>
							{(['tubes', 'height', 'sections', 'length', 'width'] as DimensionKey[]).map(key => {
								if (!details.filters[key]) return null
								const isColumnTubeSwitcher = isCategory && key === 'tubes' && details.model.type === 'columns'
								const isFamilyHeightSwitcher = useFamilyByHeight && key === 'height' && (details.model.type === 'columns' || details.model.type === 'ironcast')
								const familyHeightOptions = isFamilyHeightSwitcher ? getFamilyHeightOptions(models, details.model) : []
								const available = isFamilyHeightSwitcher
									? familyHeightOptions
									: isColumnTubeSwitcher
									? ['2', '3', '4', '5'].filter(value => Boolean(getColumnTubeModelId(models, details.model.id, value)))
									: getAvailableOptions(details, selection, key)
								const options = isFamilyHeightSwitcher ? familyHeightOptions : isColumnTubeSwitcher ? ['2', '3', '4', '5'] : getDimensionOptions(details, key)
								const titleByKey: Record<DimensionKey, string> = {
									tubes: 'Трубок в секции',
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
										onChange={value => {
											if (isFamilyHeightSwitcher) {
												const nextModelId = getFamilyModelIdByHeight(models, details.model, value)
												if (nextModelId) {
													setSelectedModelId(nextModelId)
													return
												}
												setDimension(key, value)
												return
											}
											if (isColumnTubeSwitcher) {
												const nextModelId = getColumnTubeModelId(models, details.model.id, value)
												if (nextModelId) setSelectedModelId(nextModelId)
											return
										}
										setDimension(key, value)
									}}
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
								label={details.model.type === 'ironcast' ? 'Отделка / цвет' : 'Цвет'}
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
						<label
							class={`flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-[13px] text-neutral-800 ${
								isModal ? '' : 'md:px-3 md:text-sm'
							}`}
						>
							<input
								type='checkbox'
								checked={selection.addon}
								onChange={() => setSelection(current => ({ ...current, addon: !current.addon }))}
							/>
							{details.options.addon.label}
						</label>
					)}

					{result ? (
						<div class={`rounded-xl border border-neutral-200 bg-neutral-50 ${isModal ? 'p-3' : 'p-3.5 md:rounded-2xl md:p-3.5'}`}>
							<div class='text-[10px] font-thin uppercase tracking-tight text-neutral-500'>Найденный вариант</div>
							<a
								href={details.model.href}
								onClick={() => onNavigate?.()}
								class={`mt-1.5 block text-[15px] font-semibold leading-5 text-neutral-950 hover:text-red-700 ${
									isModal ? '' : 'md:text-base'
								}`}
							>
								{result.title}
							</a>
							<div class={`mt-2 text-[11px] leading-tight text-neutral-500 ${isModal ? '' : 'md:mt-0.5 md:text-xs'}`}>{summary}</div>
							{details.model.type === 'ironcast' && sizeLabel && (
								<div class='mt-1.5 text-[11px] leading-tight text-neutral-500 md:text-xs'>
									Размер: {sizeLabel} мм
								</div>
							)}
							<div class={`mt-3 flex items-end justify-between gap-2.5 ${isModal ? '' : 'md:mt-3 md:gap-3'}`}>
								<div>
									{totalPrice > 0 && (
										<div class='text-[22px] font-semibold leading-none tracking-[-0.03em] md:text-2xl'>
											{formatRub(totalPrice)}
										</div>
									)}
									{result.dt70 && (
										<div class='mt-1.5 text-[11px] text-neutral-500 md:mt-0.5 md:text-xs'>
											Мощность ΔT70: {result.dt70} Вт
										</div>
									)}
								</div>
								{!isFloorModel && matchedVariants.length > 1 && (
									<a
										href={details.model.href}
										onClick={() => onNavigate?.()}
										class={`text-right text-[11px] font-medium leading-4 text-red-700 hover:underline ${isModal ? '' : 'md:text-xs'}`}
									>
										Еще {matchedVariants.length - 1} вариантов
									</a>
								)}
							</div>

							<div class={`mt-3 flex flex-wrap items-center gap-2 ${isModal ? '' : 'md:mt-3'}`}>
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
										class={`h-10 flex-1 rounded-lg bg-red-700 px-4 text-[13px] font-sm text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-neutral-300 ${
											isModal ? '' : 'md:text-sm'
										}`}
										disabled={!totalPrice}
										onClick={handleAddToCart}
									>
										Добавить в корзину
									</button>
								)}
							</div>

							<div class={`mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] leading-5 ${isModal ? '' : 'md:mt-3 md:gap-x-4 md:gap-y-2 md:text-sm'}`}>
								<a
									href={details.model.href}
									onClick={() => onNavigate?.()}
									class='font-medium text-neutral-700 hover:text-red-700 hover:underline'
								>
									Подробнее о модели
								</a>
								<a
									href='/cart'
									onClick={() => onNavigate?.()}
									class='font-medium text-red-700 hover:underline'
								>
									Перейти в корзину
								</a>
							</div>
						</div>
					) : (
						<div class='rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[13px] text-neutral-600 md:p-4 md:text-sm'>
							{isFloorModel ? (
								<>
									<div>Для выбранной длины нет варианта с таким подключением.</div>
									<div class='mt-1'>Выберите другую длину или тип подключения.</div>
								</>
							) : (
								<div>Для выбранных параметров нет варианта. Измените один из размеров.</div>
							)}
						</div>
					)}

					{loading && (
						<div class='absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/55 backdrop-blur-[1px]'>
							<div class='inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm'>
								<span class='h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-red-600'></span>
								Обновляем модель...
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
