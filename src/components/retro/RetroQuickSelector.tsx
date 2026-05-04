import { useMemo, useState } from 'preact/hooks'

type RetroModel = {
	id: string
	name: string
	href: string
	priceFrom: number
	height: string
	width: string
	dt70: string
	weight: string
	image: string
	description: string
}

type Props = {
	models: RetroModel[]
}

const finishes = ['Базовый цвет', 'Патина', 'Бронза', 'Золото', 'Серебро', 'Цвет RAL / по запросу']
const sectionOptions = ['4 секции', '6 секций', '8 секций', '10 секций', '12 секций', 'Другое']

function formatRub(value: number): string {
	return `${value.toLocaleString('ru-RU')} ₽`
}

export default function RetroQuickSelector({ models }: Props) {
	const [modelId, setModelId] = useState(models[0]?.id ?? '')
	const [finish, setFinish] = useState(finishes[0])
	const [sections, setSections] = useState(sectionOptions[1])
	const [city, setCity] = useState('')

	const selectedModel = useMemo(
		() => models.find(model => model.id === modelId) ?? models[0],
		[modelId, models],
	)

	return (
		<div class='rounded-[22px] border border-neutral-200 bg-white p-4 text-neutral-950 shadow-none md:p-5'>
			<div>
				<h2 class='text-lg font-semibold leading-tight tracking-tight'>Быстрый подбор</h2>
				<p class='mt-1 text-sm leading-5 text-neutral-600'>Параметры для предварительного расчета.</p>
			</div>

			<div class='mt-4 grid gap-3'>
				<label class='grid gap-1.5'>
					<span class='text-[10px] font-thin uppercase tracking-tight text-neutral-600'>Модель</span>
					<select
						class='h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100'
						value={modelId}
						onChange={event => setModelId((event.currentTarget as HTMLSelectElement).value)}
					>
						{models.map(model => (
							<option value={model.id}>Velar {model.name}</option>
						))}
					</select>
				</label>

				<label class='grid gap-1.5'>
					<span class='text-[10px] font-thin uppercase tracking-tight text-neutral-600'>Отделка / цвет</span>
					<select
						class='h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100'
						value={finish}
						onChange={event => setFinish((event.currentTarget as HTMLSelectElement).value)}
					>
						{finishes.map(item => (
							<option value={item}>{item}</option>
						))}
					</select>
				</label>

				<label class='grid gap-1.5'>
					<span class='text-[10px] font-thin uppercase tracking-tight text-neutral-600'>Количество секций</span>
					<select
						class='h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100'
						value={sections}
						onChange={event => setSections((event.currentTarget as HTMLSelectElement).value)}
					>
						{sectionOptions.map(item => (
							<option value={item}>{item}</option>
						))}
					</select>
				</label>

				<label class='grid gap-1.5'>
					<span class='text-[10px] font-thin uppercase tracking-tight text-neutral-600'>Город доставки</span>
					<input
						class='h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
						value={city}
						placeholder='Например, Москва'
						onInput={event => setCity((event.currentTarget as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{selectedModel && (
				<div class='mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5'>
					<div class='flex gap-3'>
						<img
							src={selectedModel.image}
							alt={`Чугунный ретро-радиатор Velar ${selectedModel.name}`}
							class='h-20 w-20 shrink-0 rounded-xl bg-white object-contain p-2'
							loading='lazy'
						/>
						<div class='min-w-0'>
							<div class='text-[10px] font-thin uppercase tracking-tight text-neutral-500'>Ориентировочная цена</div>
							<div class='mt-1 text-2xl font-semibold leading-none tracking-tight'>от {formatRub(selectedModel.priceFrom)}</div>
							<div class='mt-2 text-xs leading-5 text-neutral-600'>
								{selectedModel.height} · {selectedModel.width} · {selectedModel.dt70} Вт/секц.
							</div>
						</div>
					</div>
					<p class='mt-3 text-xs leading-5 text-neutral-600'>
						Точный расчет зависит от модели, количества секций, города доставки и декоративной отделки.
					</p>
				</div>
			)}

			<a href='/request' class='mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800'>
				Получить точный расчет
			</a>
			<a href='/request' class='mt-3 inline-flex w-full items-center justify-center text-sm font-semibold text-neutral-700 transition hover:text-red-700'>
				Задать вопрос менеджеру
			</a>
		</div>
	)
}
