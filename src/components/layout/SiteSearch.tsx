import type { ComponentChildren, JSX } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { reachMetrikaGoal } from '@shared/utils/metrika'
import {
	SEARCH_TYPE_LABEL,
	SEARCH_TYPE_WORDS,
	type SearchIndex,
	type SearchModelEntry,
	type SearchPageEntry,
} from '../../lib/searchTypes'

type Props = {
	/** Быстрый конфигуратор: показывается, пока запрос пуст (скрывается, а не удаляется, чтобы не терять его состояние) */
	children?: ComponentChildren
	/** Вызывается при переходе по результату (закрыть модальное окно) */
	onNavigate?: () => void
}

type Result = {
	id: string
	group: 'models' | 'sections' | 'articles'
	title: string
	href: string
	meta: string
}

type Outcome = {
	results: Result[]
	colorHint: boolean
}

type PreparedModel = {
	entry: SearchModelEntry
	codes: string[]
	hay: string
}

type PreparedPage = {
	entry: SearchPageEntry
	hay: string
}

type PreparedIndex = {
	models: PreparedModel[]
	sections: PreparedPage[]
	articles: PreparedPage[]
}

type ParsedQuery = {
	numbers: string[]
	words: string[]
	colors: string[]
	codes: string[]
}

const GROUP_TITLE: Record<Result['group'], string> = {
	models: 'Модели',
	sections: 'Разделы и подборки',
	articles: 'Статьи',
}

const MAX_RESULTS = 12
const GROUP_CAPS: Record<Result['group'], number> = { models: 8, sections: 3, articles: 2 }
const GROUP_ORDER: Array<Result['group']> = ['models', 'sections', 'articles']

const ORIENTATION_WORDS = {
	v: 'вертикальный вертикальные вертикально',
	h: 'горизонтальный горизонтальные горизонтально',
}

const COLOR_PREFIXES = [
	'черн',
	'бел',
	'графит',
	'красн',
	'антрацит',
	'ral',
	'рал',
	'цвет',
	'серы',
	'серебр',
	'зелен',
	'бежев',
	'коричнев',
	'золот',
	'бронз',
	'оттенок',
	'окраск',
	'покраск',
	'краск',
]

// Слова, которые есть почти везде и только сужают поиск зря
const STOP_WORDS = new Set(['и', 'в', 'на', 'для', 'с', 'от', 'до', 'мм', 'velar', 'велар', 'модель', 'модели'])
const STOP_PREFIXES = ['радиатор', 'высот', 'межосев', 'расстоян', 'цена', 'цены', 'стоимост']

// Раскладка: «з30м» -> «p30v», если код набрали на русской раскладке
const RU_TO_LAT: Record<string, string> = {
	й: 'q',
	ц: 'w',
	у: 'e',
	к: 'r',
	е: 't',
	н: 'y',
	г: 'u',
	ш: 'i',
	щ: 'o',
	з: 'p',
	ф: 'a',
	ы: 's',
	в: 'd',
	а: 'f',
	п: 'g',
	р: 'h',
	о: 'j',
	л: 'k',
	д: 'l',
	я: 'z',
	ч: 'x',
	с: 'c',
	м: 'v',
	и: 'b',
	т: 'n',
	ь: 'm',
}

function normalize(value: string): string {
	return value
		.toLowerCase()
		.replace(/ё/g, 'е')
		.replace(/[^a-zа-я0-9]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function squash(value: string): string {
	return value.replace(/\s+/g, '')
}

function layoutToLatin(value: string): string {
	return value.replace(/[а-я]/g, char => RU_TO_LAT[char] ?? char)
}

function stem(word: string): string {
	return word.length >= 6 ? word.slice(0, -2) : word
}

function isColorWord(token: string): boolean {
	return COLOR_PREFIXES.some(prefix => token.startsWith(prefix))
}

function isStopWord(token: string): boolean {
	return STOP_WORDS.has(token) || STOP_PREFIXES.some(prefix => token.startsWith(prefix))
}

function parseQuery(raw: string): ParsedQuery {
	const text = normalize(raw)
	const tokens = text.split(' ').filter(Boolean)
	const numbers: string[] = []
	const words: string[] = []
	const colors: string[] = []
	// Токены без цвета и стоп-слов: по ним ищем код модели («черный p30» → «p30»)
	const rest: string[] = []

	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index]
		if (token === 'ral' || token === 'рал') {
			colors.push(token)
			// «ral 9005»: номер оттенка не считаем размером
			if (/^\d{4}$/.test(tokens[index + 1] ?? '')) index += 1
			continue
		}
		if (isColorWord(token)) {
			colors.push(token)
			continue
		}
		if (/^\d+$/.test(token)) {
			numbers.push(token)
			rest.push(token)
			continue
		}
		if (isStopWord(token)) continue
		rest.push(token)
		if (token.length < 2) continue
		words.push(token)
	}

	const codes: string[] = []
	const codeText = rest.join(' ')
	if (codeText.length >= 2) {
		const direct = squash(codeText)
		codes.push(direct)
		const converted = squash(layoutToLatin(codeText))
		if (converted !== direct) codes.push(converted)
	}

	return { numbers, words, colors, codes }
}

function prepareIndex(index: SearchIndex): PreparedIndex {
	return {
		models: index.m.map(entry => {
			const name = normalize(entry.t.replace(/^Velar\s+/i, ''))
			const codes = [...new Set([normalize(entry.i), squash(name)])]
			const hay = normalize(
				[
					entry.t,
					SEARCH_TYPE_LABEL[entry.k],
					SEARCH_TYPE_WORDS[entry.k],
					entry.o ? ORIENTATION_WORDS[entry.o] : '',
				].join(' '),
			)
			return { entry, codes, hay }
		}),
		sections: index.s.map(entry => ({ entry, hay: normalize(`${entry.t} ${entry.w ?? ''} ${entry.d ?? ''}`) })),
		articles: index.a.map(entry => ({ entry, hay: normalize(`${entry.t} ${entry.d ?? ''}`) })),
	}
}

type ModelHit = {
	model: PreparedModel
	score: number
	height?: string
	spacing?: string
}

function matchModel(model: PreparedModel, query: ParsedQuery): ModelHit | null {
	const { entry } = model
	let score = 0

	for (const code of query.codes) {
		for (const modelCode of model.codes) {
			if (modelCode === code) score = Math.max(score, 100)
			else if (code.length >= 2 && modelCode.startsWith(code)) score = Math.max(score, 60)
			else if (code.length >= 2 && modelCode.includes(code)) score = Math.max(score, 40)
		}
	}

	let height: string | undefined
	let spacing: string | undefined
	for (const number of query.numbers) {
		if (number === entry.i) continue
		if (!height && entry.H.includes(number)) height = number
		else if (!spacing && entry.S.includes(number)) spacing = number
	}

	if (score > 0) return { model, score, height, spacing }

	if (!query.numbers.length && !query.words.length) return null

	for (const number of query.numbers) {
		const known = entry.H.includes(number) || entry.S.includes(number) || model.hay.includes(number)
		if (!known) return null
	}
	for (const word of query.words) {
		if (!model.hay.includes(stem(word))) return null
	}
	return { model, score: height || spacing ? 30 : 20, height, spacing }
}

function matchPage(page: PreparedPage, query: ParsedQuery, useColors: boolean): boolean {
	const numbers = query.numbers
	// Короткие числа ничего не говорят про страницу и дают случайные совпадения
	if (numbers.some(number => number.length < 3)) return false
	const words = useColors ? query.colors : query.words
	if (!numbers.length && !words.length) return false
	return numbers.every(number => page.hay.includes(number)) && words.every(word => page.hay.includes(stem(word)))
}

function formatNumber(value: number): string {
	return value.toLocaleString('ru-RU')
}

function heightRange(heights: string[]): string {
	const values = heights.map(Number).filter(value => Number.isFinite(value) && value > 0)
	if (!values.length) return ''
	const min = Math.min(...values)
	const max = Math.max(...values)
	return min === max ? `высота ${formatNumber(min)} мм` : `высота ${formatNumber(min)}–${formatNumber(max)} мм`
}

function modelResult(hit: ModelHit): Result {
	const { entry } = hit.model
	const params: string[] = []
	const parts: string[] = [SEARCH_TYPE_LABEL[entry.k]]

	if (hit.height) {
		params.push(`height=${hit.height}`)
		parts.push(`высота ${formatNumber(Number(hit.height))} мм`)
	} else {
		const range = heightRange(entry.H)
		if (range) parts.push(range)
	}
	if (hit.spacing) {
		params.push(`mo=${hit.spacing}`)
		parts.push(`межосевое ${formatNumber(Number(hit.spacing))} мм`)
	}
	if (entry.p > 0) parts.push(`от ${formatNumber(entry.p)} ₽`)

	const query = params.length ? `?${params.join('&')}` : ''
	return {
		id: `model:${entry.i}`,
		group: 'models',
		title: entry.t,
		href: `${entry.h}${query}#model-variants`,
		meta: parts.join(' · '),
	}
}

function pageResult(page: PreparedPage, group: 'sections' | 'articles'): Result {
	return {
		id: `${group}:${page.entry.h}`,
		group,
		title: page.entry.t,
		href: page.entry.h,
		meta: page.entry.d ?? '',
	}
}

function limitResults(groups: Record<Result['group'], Result[]>): Result[] {
	const taken: Record<Result['group'], number> = { models: 0, sections: 0, articles: 0 }
	let total = 0
	for (const group of GROUP_ORDER) {
		const count = Math.min(groups[group].length, GROUP_CAPS[group], MAX_RESULTS - total)
		taken[group] = count
		total += count
	}
	// Если какая-то группа не добрала лимит, отдаем место остальным по порядку
	for (const group of GROUP_ORDER) {
		if (total >= MAX_RESULTS) break
		const extra = Math.min(groups[group].length - taken[group], MAX_RESULTS - total)
		if (extra > 0) {
			taken[group] += extra
			total += extra
		}
	}
	return GROUP_ORDER.flatMap(group => groups[group].slice(0, taken[group]))
}

function runSearch(prepared: PreparedIndex, raw: string): Outcome {
	const query = parseQuery(raw)
	const hasColor = query.colors.length > 0
	const hasOther = query.numbers.length > 0 || query.words.length > 0
	const groups: Record<Result['group'], Result[]> = { models: [], sections: [], articles: [] }

	if (hasColor && !hasOther) {
		// Только цвет: фильтра по цвету нет, ведем в дизайн и трубчатые
		for (const href of ['/design', '/columns']) {
			const hub = prepared.sections.find(page => page.entry.h === href)
			if (hub) groups.sections.push(pageResult(hub, 'sections'))
		}
		for (const page of prepared.articles) {
			if (matchPage(page, query, true)) groups.articles.push(pageResult(page, 'articles'))
		}
		return { results: limitResults(groups), colorHint: true }
	}

	if (!hasOther && !query.codes.length) {
		return { results: [], colorHint: hasColor }
	}

	const hits: ModelHit[] = []
	for (const model of prepared.models) {
		const hit = matchModel(model, query)
		if (hit) hits.push(hit)
	}
	hits.sort((a, b) => b.score - a.score)
	groups.models = hits.map(modelResult)

	if (hasOther) {
		for (const page of prepared.sections) {
			if (matchPage(page, query, false)) groups.sections.push(pageResult(page, 'sections'))
		}
		for (const page of prepared.articles) {
			if (matchPage(page, query, false)) groups.articles.push(pageResult(page, 'articles'))
		}
	}

	return { results: limitResults(groups), colorHint: hasColor }
}

// Индекс грузим один раз при первом открытии и держим в модуле
let preparedCache: PreparedIndex | null = null
let indexPromise: Promise<PreparedIndex> | null = null

function loadIndex(): Promise<PreparedIndex> {
	if (preparedCache) return Promise.resolve(preparedCache)
	if (!indexPromise) {
		indexPromise = fetch('/search-index.json')
			.then(response => {
				if (!response.ok) throw new Error(`search-index ${response.status}`)
				return response.json() as Promise<SearchIndex>
			})
			.then(data => {
				preparedCache = prepareIndex(data)
				return preparedCache
			})
			.catch(error => {
				indexPromise = null
				throw error
			})
	}
	return indexPromise
}

export default function SiteSearch({ children, onNavigate }: Props) {
	const [query, setQuery] = useState('')
	const [prepared, setPrepared] = useState<PreparedIndex | null>(preparedCache)
	const [failed, setFailed] = useState(false)
	const [active, setActive] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const keyboardMove = useRef(false)
	const reportedEmpty = useRef<Set<string>>(new Set())

	const trimmed = query.trim()

	useEffect(() => {
		inputRef.current?.focus()
		let cancelled = false
		loadIndex()
			.then(index => {
				if (!cancelled) setPrepared(index)
			})
			.catch(() => {
				if (!cancelled) setFailed(true)
			})
		return () => {
			cancelled = true
		}
	}, [])

	const outcome = useMemo<Outcome | null>(() => {
		if (!trimmed || !prepared) return null
		return runSearch(prepared, trimmed)
	}, [prepared, trimmed])

	const results = outcome?.results ?? []

	useEffect(() => {
		setActive(0)
	}, [trimmed])

	useEffect(() => {
		if (!keyboardMove.current) return
		keyboardMove.current = false
		document.getElementById(`site-search-option-${active}`)?.scrollIntoView({ block: 'nearest' })
	}, [active])

	// Пустая выдача на запросе от 3 символов: фиксируем один раз, когда человек перестал печатать
	useEffect(() => {
		if (!outcome || outcome.results.length || trimmed.length < 3) return
		if (reportedEmpty.current.has(trimmed)) return
		const timer = window.setTimeout(() => {
			reportedEmpty.current.add(trimmed)
			reachMetrikaGoal('site_search_empty', { q: trimmed })
		}, 1500)
		return () => window.clearTimeout(timer)
	}, [outcome, trimmed])

	const registerClick = (result: Result) => {
		reachMetrikaGoal('site_search', { q: trimmed, href: result.href })
	}

	const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
		if (!results.length) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			keyboardMove.current = true
			setActive(current => (current + 1) % results.length)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			keyboardMove.current = true
			setActive(current => (current - 1 + results.length) % results.length)
		} else if (event.key === 'Enter') {
			const target = results[Math.min(active, results.length - 1)]
			if (!target) return
			event.preventDefault()
			registerClick(target)
			onNavigate?.()
			window.location.assign(target.href)
		}
	}

	const handleInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
		setQuery(event.currentTarget.value)
	}

	const hasQuery = trimmed.length > 0
	const listId = 'site-search-results'

	return (
		<div>
			<div class='relative'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='18'
					height='18'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
					class='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500'
				>
					<circle cx='11' cy='11' r='8'></circle>
					<path d='m21 21-4.3-4.3'></path>
				</svg>
				<input
					ref={inputRef}
					type='text'
					autoComplete='off'
					spellcheck={false}
					role='combobox'
					aria-label='Поиск по сайту'
					aria-expanded={hasQuery && results.length > 0}
					aria-controls={listId}
					aria-activedescendant={hasQuery && results.length ? `site-search-option-${active}` : undefined}
					placeholder='Модель, высота или цвет: 3057, 1800, черный'
					value={query}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					class='h-11 w-full rounded-[3px] border border-neutral-300 bg-white pl-10 pr-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300'
				/>
			</div>

			{hasQuery && (
				<div class='mt-3' id={listId} role='listbox' aria-label='Результаты поиска'>
					{failed && !prepared && (
						<p class='text-sm text-neutral-600'>
							Поиск временно недоступен. Откройте{' '}
							<a href='/columns' class='text-neutral-900 underline underline-offset-2'>
								каталог
							</a>{' '}
							или{' '}
							<a href='/request' class='text-neutral-900 underline underline-offset-2'>
								оставьте заявку
							</a>
							.
						</p>
					)}

					{!failed && !prepared && <p class='text-sm text-neutral-500'>Ищем...</p>}

					{outcome?.colorHint && (
						<p class='mb-3 rounded-[3px] border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700'>
							Все модели Velar красятся в цвета RAL, цвет выбирается в таблице размеров на странице модели
						</p>
					)}

					{outcome && results.length === 0 && !outcome.colorHint && (
						<div class='rounded-[3px] border border-neutral-200 px-3 py-3'>
							<p class='text-sm font-medium text-neutral-900'>Ничего не нашли</p>
							<p class='mt-1 text-sm text-neutral-600'>Попробуйте код модели (например 3057 или p30v) или высоту в миллиметрах.</p>
							<a
								href='/request'
								class='mt-2 inline-block text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-700'
								onClick={() => onNavigate?.()}
							>
								Подберем по вашим размерам
							</a>
						</div>
					)}

					{outcome && results.length === 0 && outcome.colorHint && (
						<p class='text-sm text-neutral-600'>
							Уточните модель или высоту, например «3057 черный», или{' '}
							<a href='/request' class='text-neutral-900 underline underline-offset-2' onClick={() => onNavigate?.()}>
								подберем по вашим размерам
							</a>
							.
						</p>
					)}

					{results.map((result, index) => (
						<div key={result.id}>
							{(index === 0 || results[index - 1].group !== result.group) && (
								<p class={`px-3 pb-1 text-xs font-medium text-neutral-500 ${index === 0 ? '' : 'mt-3'}`}>
									{GROUP_TITLE[result.group]}
								</p>
							)}
							<a
								id={`site-search-option-${index}`}
								role='option'
								aria-selected={index === active}
								href={result.href}
								onMouseMove={() => {
									if (index !== active) setActive(index)
								}}
								onClick={event => {
									registerClick(result)
									if (!event.metaKey && !event.ctrlKey && !event.shiftKey) onNavigate?.()
								}}
								class={`block rounded-[3px] px-3 py-2 text-neutral-900 transition-colors hover:bg-neutral-50 ${index === active ? 'bg-neutral-50' : ''}`}
							>
								<span class='block text-sm font-medium'>{result.title}</span>
								{result.meta && <span class='mt-0.5 block text-xs text-neutral-600'>{result.meta}</span>}
							</a>
						</div>
					))}
				</div>
			)}

			<div class={`mt-4 ${hasQuery ? 'hidden' : ''}`}>{children}</div>
		</div>
	)
}
