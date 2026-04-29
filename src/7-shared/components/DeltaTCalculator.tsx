import { useMemo, useState } from 'preact/hooks'

const MIN_DT = 20
const MAX_DT = 70
const DEFAULT_Q70 = 1050
const N_HIGH = 1.2873828318254765
const N_LOW = 1.3593354963761421

type PassportPoints = {
	q50: number
	q60: number
	q70: number
}

function derivePassport(q70: number): PassportPoints {
	const safeQ70 = Math.max(q70, 0)
	const q60 = safeQ70 * Math.pow(60 / 70, N_HIGH)
	const q50 = q60 * Math.pow(50 / 60, N_LOW)
	return { q50, q60, q70: safeQ70 }
}

function calcPowerByDt(dt: number, passport: PassportPoints): number {
	const d = Math.max(MIN_DT, Math.min(MAX_DT, dt))

	if (d >= 60) {
		return passport.q70 * Math.pow(d / 70, N_HIGH)
	}

	if (d >= 50) {
		return passport.q60 * Math.pow(d / 60, N_LOW)
	}

	return passport.q60 * Math.pow(d / 60, N_LOW)
}

export default function DeltaTPowerCalculator() {
	const [q70, setQ70] = useState(DEFAULT_Q70)
	const [dt, setDt] = useState(60)

	const passport = useMemo(() => derivePassport(q70), [q70])
	const power = useMemo(() => calcPowerByDt(dt, passport), [dt, passport])
	const roundedPower = Math.round(power)
	const formattedPower = roundedPower.toLocaleString('ru-RU')

	return (
		<section class='not-prose my-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-6'>
			<label class='block'>
				<div class='mb-1 text-sm text-neutral-600'>Паспортная мощность при ΔT=70</div>
				<input
					class='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base'
					type='number'
					min={0}
					value={q70}
					onInput={event => {
						const value = parseFloat((event.currentTarget as HTMLInputElement).value)
						setQ70(Number.isFinite(value) ? value : 0)
					}}
				/>
			</label>

			<div class='mt-6 rounded-xl bg-white p-4 ring-1 ring-neutral-200'>
				<div class='mb-2 flex items-center justify-between text-sm text-neutral-600'>
					<span>ΔT, °C</span>
					<span class='font-semibold text-neutral-800'>{dt}°</span>
				</div>

				<input
					class='w-full accent-red-700'
					type='range'
					min={MIN_DT}
					max={MAX_DT}
					step={1}
					value={dt}
					onInput={event => setDt(Number((event.currentTarget as HTMLInputElement).value))}
				/>
				<div class='mt-1 flex justify-between text-xs text-neutral-500'>
					<span>{MIN_DT}°</span>
					<span>{MAX_DT}°</span>
				</div>
			</div>

			<div class='mt-5 rounded-2xl bg-white p-4 ring-1 ring-neutral-200'>
				<div class='text-sm text-neutral-500'>Ориентировочная теплоотдача при текущем ΔT</div>
				<div class='mt-1 text-3xl font-semibold text-neutral-900'>{formattedPower} Вт</div>
			</div>

			<div class='mt-4 text-xs text-neutral-500'>
				Расчет справочный. Паспортные значения мощности зависят от стандарта испытаний. Реальная теплоотдача зависит от
				температур системы, расхода теплоносителя, схемы подключения и условий установки.
			</div>
		</section>
	)
}
