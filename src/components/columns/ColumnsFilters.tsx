import { useEffect, useState } from 'preact/hooks'

type FilterState = {
	height: string
	tubes: string
}

type FilterStats = {
	matched: number
	shown: number
}

const PAGE_SIZE = 20

const initialState: FilterState = {
	height: 'all',
	tubes: 'all',
}

const heightOptions = [
	{ value: 'all', label: 'Все' },
	{ value: 'h500', label: 'До 500 мм' },
	{ value: 'h500_700', label: '500–700 мм' },
	{ value: 'h700_1200', label: '700–1200 мм' },
	{ value: 'h1200', label: 'Выше 1200 мм' },
]

const tubeOptions = [
	{ value: 'all', label: 'Все' },
	{ value: '2', label: '2 трубки' },
	{ value: '3', label: '3 трубки' },
	{ value: '4', label: '4 трубки' },
]

function matchesHeight(height: number, value: string): boolean {
	if (value === 'all') return true
	if (value === 'h500') return height <= 500
	if (value === 'h500_700') return height > 500 && height <= 700
	if (value === 'h700_1200') return height > 700 && height <= 1200
	if (value === 'h1200') return height > 1200
	return true
}

function applyFilters(state: FilterState, visibleLimit: number): FilterStats {
	const cards = document.querySelectorAll<HTMLElement>('[data-columns-card="1"]')
	const matchedCards: HTMLElement[] = []

	cards.forEach(card => {
		const height = Number(card.dataset.height || '0')
		const tubes = card.dataset.tubes || ''

		const matchHeight = matchesHeight(height, state.height)
		const matchTubes = state.tubes === 'all' || tubes === state.tubes
		const show = matchHeight && matchTubes

		if (show) {
			matchedCards.push(card)
		} else {
			card.style.display = 'none'
		}
	})

	matchedCards.forEach((card, index) => {
		card.style.display = index < visibleLimit ? '' : 'none'
	})

	return {
		matched: matchedCards.length,
		shown: Math.min(visibleLimit, matchedCards.length),
	}
}

function filterButtonClass(active: boolean): string {
	return active
		? 'inline-flex h-7 !cursor-pointer items-center justify-center rounded-[3px] border border-red-700 bg-red-700 px-2.5 text-xs font-medium text-white transition-colors hover:cursor-pointer hover:border-red-800 hover:bg-red-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2'
		: 'inline-flex h-7 !cursor-pointer items-center justify-center rounded-[3px] border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-800 transition-colors hover:cursor-pointer hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2'
}

export default function ColumnsFilters() {
	const [filters, setFilters] = useState<FilterState>(initialState)
	const [visibleCount, setVisibleCount] = useState(0)
	const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)
	const [wasChanged, setWasChanged] = useState(false)

	const hasActiveFilters = filters.height !== 'all' || filters.tubes !== 'all'

	useEffect(() => {
		const stats = applyFilters(filters, visibleLimit)
		setVisibleCount(stats.shown)
		const summaryCountNode = document.getElementById('columns-catalog-count')
		if (summaryCountNode) summaryCountNode.textContent = `${stats.shown} из ${stats.matched}`

		const showMoreButton = document.getElementById('columns-show-more')
		if (showMoreButton instanceof HTMLButtonElement) {
			const hasMore = stats.shown < stats.matched
			showMoreButton.style.display = hasMore ? 'inline-flex' : 'none'
			showMoreButton.textContent = `Показать ещё (${Math.min(PAGE_SIZE, stats.matched - stats.shown)})`
		}
	}, [filters, visibleLimit])

	useEffect(() => {
		const onClick = (event: Event) => {
			const target = event.target
			if (!(target instanceof HTMLElement)) return
			const button = target.closest('#columns-show-more')
			if (!(button instanceof HTMLButtonElement)) return
			setVisibleLimit(prev => prev + PAGE_SIZE)
		}

		document.addEventListener('click', onClick)
		return () => document.removeEventListener('click', onClick)
	}, [])

	return (
		<div class='rounded-lg border border-neutral-200 bg-white px-3 py-3'>
			<div class='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
				<div class='flex-1 space-y-2'>
					<div class='flex flex-col gap-2 md:flex-row md:items-center'>
						<div class='shrink-0 text-xs font-normal text-neutral-600 md:w-[120px]'>Высота</div>
						<div class='flex flex-wrap gap-2'>
							{heightOptions.map(option => (
								<button
									type='button'
									aria-pressed={filters.height === option.value}
									class={filterButtonClass(filters.height === option.value)}
									style={{ cursor: 'pointer' }}
									onClick={() => {
										setWasChanged(true)
										setVisibleLimit(PAGE_SIZE)
										setFilters(prev => ({ ...prev, height: option.value }))
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					<div class='flex flex-col gap-2 md:flex-row md:items-center'>
						<div class='shrink-0 text-xs font-normal text-neutral-600 md:w-[120px]'>Трубок в секции</div>
						<div class='flex flex-wrap gap-2'>
							{tubeOptions.map(option => (
								<button
									type='button'
									aria-pressed={filters.tubes === option.value}
									class={filterButtonClass(filters.tubes === option.value)}
									style={{ cursor: 'pointer' }}
									onClick={() => {
										setWasChanged(true)
										setVisibleLimit(PAGE_SIZE)
										setFilters(prev => ({ ...prev, tubes: option.value }))
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{hasActiveFilters ? (
					<button
						type='button'
						class='text-xs font-medium text-red-700 transition-colors hover:underline'
						onClick={() => {
							setWasChanged(true)
							setVisibleLimit(PAGE_SIZE)
							setFilters(initialState)
						}}
					>
						Сбросить
					</button>
				) : null}
			</div>

			{hasActiveFilters && wasChanged && visibleCount === 0 ? (
				<div class='mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700'>
					<div>
						По выбранным параметрам моделей не найдено. Попробуйте изменить фильтр или отправьте заявку на
						подбор.
					</div>
					<a
						href='/request'
						class='mt-3 inline-flex h-9 items-center justify-center rounded-[3px] border border-red-700 bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800 hover:border-red-800'
					>
						Получить подбор
					</a>
				</div>
			) : null}
		</div>
	)
}
