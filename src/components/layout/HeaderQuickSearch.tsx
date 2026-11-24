import { useEffect, useRef, useState } from 'preact/hooks'

import SiteSearch from './SiteSearch'
import HeroQuickConfigurator, { type ModelDetails, type ModelOption } from '@widgets/pageMain/HeroQuickConfigurator'

// Список моделей грузим один раз при первом открытии модалки и держим в модуле (как индекс в SiteSearch),
// чтобы не отдавать его props'ами в HTML каждой страницы.
let modelsCache: ModelOption[] | null = null
let modelsPromise: Promise<ModelOption[]> | null = null

function loadModels(): Promise<ModelOption[]> {
	if (modelsCache) return Promise.resolve(modelsCache)
	if (!modelsPromise) {
		modelsPromise = fetch('/api/quick-search-models.json')
			.then(response => {
				if (!response.ok) throw new Error(`quick-search-models ${response.status}`)
				return response.json() as Promise<ModelOption[]>
			})
			.then(data => {
				modelsCache = data
				return data
			})
			.catch(error => {
				modelsPromise = null
				throw error
			})
	}
	return modelsPromise
}

type Props = {
	defaultModelId: string
	initialDetails?: ModelDetails | null
	buttonClassName?: string
	// Phone header: the trigger lives in the bottom bar, which opens this modal through a window event
	hideTrigger?: boolean
	openEventName?: string
}

export default function HeaderQuickSearch({
	defaultModelId,
	initialDetails = null,
	buttonClassName = '',
	hideTrigger = false,
	openEventName,
}: Props) {
	const [open, setOpen] = useState(false)
	const [session, setSession] = useState(0)
	const [models, setModels] = useState<ModelOption[] | null>(modelsCache)
	const [modelsFailed, setModelsFailed] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (!open || models) return

		let cancelled = false
		setModelsFailed(false)
		loadModels()
			.then(data => {
				if (!cancelled) setModels(data)
			})
			.catch(() => {
				if (!cancelled) setModelsFailed(true)
			})
		return () => {
			cancelled = true
		}
	}, [open, session])

	useEffect(() => {
		if (!open) return

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		window.addEventListener('keydown', handleEscape)
		return () => {
			window.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = previousOverflow
		}
	}, [open])

	const openModal = () => {
		setSession(current => current + 1)
		setOpen(true)
	}

	useEffect(() => {
		if (!openEventName) return

		const handleOpenEvent = () => openModal()
		window.addEventListener(openEventName, handleOpenEvent)
		return () => window.removeEventListener(openEventName, handleOpenEvent)
	}, [openEventName])

	return (
		<>
			{!hideTrigger && (
				<button
					type='button'
					aria-label='Поиск и быстрый подбор'
					class={`inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-[#e5e5e5] bg-white text-[#111] transition-colors hover:border-[#c1121f] hover:bg-white hover:text-[#a30f19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 ${buttonClassName}`}
					onClick={openModal}
					ref={triggerRef}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						aria-hidden='true'
					>
						<circle cx='11' cy='11' r='8'></circle>
						<path d='m21 21-4.3-4.3'></path>
					</svg>
				</button>
			)}

			{open && (
				<div class='fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4'>
					<button
						type='button'
						class='absolute inset-0 bg-black/50 backdrop-blur-[6px]'
						onClick={() => setOpen(false)}
						aria-label='Закрыть модальное окно'
					></button>
					<div
						role='dialog'
						aria-modal='true'
						aria-labelledby='quick-search-title'
						aria-describedby='quick-search-description'
						class='quick-search-modal-scroll relative z-[91] max-h-[90svh] w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.35)] sm:max-w-[660px] sm:p-5'
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						<button
							type='button'
							onClick={() => setOpen(false)}
							class='absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:border-red-200 hover:text-red-700'
							aria-label='Закрыть'
						>
							✕
						</button>
						<div class='pr-10'>
							<h2 id='quick-search-title' class='text-lg font-semibold text-neutral-950'>
								Поиск и быстрый подбор
							</h2>
							<p id='quick-search-description' class='mt-1 text-sm text-neutral-600'>
								Найдите модель по коду, высоте или цвету либо подберите параметры ниже.
							</p>
						</div>
						<div class='mt-4'>
							<SiteSearch key={`modal-search-${session}`} onNavigate={() => setOpen(false)}>
								{models ? (
									<HeroQuickConfigurator
										key={`modal-config-${session}`}
										variant='modal'
										models={models}
										defaultModelId={defaultModelId}
										initialDetails={initialDetails}
										onNavigate={() => setOpen(false)}
									/>
								) : modelsFailed ? (
									<div class='rounded-xl border border-red-100 bg-red-50 p-2.5 text-xs text-red-700 md:p-3 md:text-[13px]'>
										Не удалось загрузить подбор. Закройте окно и откройте его еще раз.
									</div>
								) : (
									<div class='rounded-xl bg-neutral-50 p-2.5 text-xs text-neutral-600 md:p-3 md:text-[13px]'>
										Загружаем доступные параметры...
									</div>
								)}
							</SiteSearch>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
