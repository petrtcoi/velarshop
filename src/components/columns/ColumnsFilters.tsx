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
	{ value: 'all', label: 'Любая' },
	{ value: 'low', label: 'Низкие' },
	{ value: 'middle', label: 'Средние' },
	{ value: 'high', label: 'Высокие' },
]

const tubeOptions = [
	{ value: 'all', label: 'Любое' },
	{ value: '2', label: '2' },
	{ value: '3', label: '3' },
	{ value: '4', label: '4' },
]

function matchesHeight(height: number, value: string): boolean {
	if (value === 'all') return true
	if (value === 'low') return height <= 400
	if (value === 'middle') return height > 400 && height <= 900
	if (value === 'high') return height >= 1000
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
		? 'inline-flex h-8 !cursor-pointer items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-3.5 text-xs font-medium text-white transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-1'
		: 'inline-flex h-8 !cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white px-3.5 text-xs font-medium text-neutral-800 transition-colors hover:cursor-pointer hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2'
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
			<div class='rounded-[20px] border border-neutral-200 bg-white p-4 md:p-5'>
				<div class='grid gap-4 md:grid-cols-[1fr_auto] md:items-end'>
					<div class='space-y-3'>
						<div class='grid gap-2 md:grid-cols-[140px_1fr] md:items-center'>
							<div class='text-xs font-medium uppercase tracking-wide text-neutral-500'>Высота</div>
							<div class='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0'>
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

						<div class='grid gap-2 md:grid-cols-[140px_1fr] md:items-center'>
							<div class='text-xs font-medium uppercase tracking-wide text-neutral-500'>Трубок в секции</div>
							<div class='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0'>
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
							class='inline-flex h-9 items-center justify-center rounded-full border border-neutral-200 px-4 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50'
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
