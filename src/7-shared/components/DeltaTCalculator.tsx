import { useMemo, useState } from "preact/hooks";
import { powerAtDeltaT, type ThermalPoints } from '../../lib/thermalPower';

const MIN_DT = 20;
const MAX_DT = 70;
type Configuration = ThermalPoints & { id: string; title: string; exponent: number; passportUrl: string };
type Props = { configurations: Configuration[] };

export default function DeltaTPowerCalculator({ configurations }: Props) {
  const [configurationId, setConfigurationId] = useState(configurations[0].id);
  const configuration = configurations.find(item => item.id === configurationId) ?? configurations[0];
  const [q70, setQ70] = useState(configuration.q70);
  const [dt, setDt] = useState(60);

  const power = useMemo(() => powerAtDeltaT(dt, Math.max(q70, 0), configuration.exponent), [dt, q70, configuration]);
  const roundedPower = Math.round(power);
  const formattedPower = roundedPower.toLocaleString("ru-RU");

  return (
    <section class="not-prose my-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-6">
      <label class="mb-5 block text-sm text-neutral-600">
        Модель для пересчета
        <select class="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base" value={configurationId} onChange={event => {
          const chosen = configurations.find(item => item.id === event.currentTarget.value) ?? configurations[0];
          setConfigurationId(chosen.id); setQ70(chosen.q70);
        }}>
          {configurations.map(item => <option value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label class="block">
        <div class="mb-1 text-sm text-neutral-600">
          Мощность при ΔT70, Вт
        </div>
        <input
          class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base"
          type="number"
          min={0}
          value={q70}
          onInput={(event) => {
            const value = parseFloat(
              (event.currentTarget as HTMLInputElement).value
            );
            setQ70(Number.isFinite(value) ? value : 0);
          }}
        />
      </label>
      <p class="mt-3 text-sm leading-6 text-neutral-600">Для выбранной конфигурации в каталоге: ΔT70 — {configuration.q70} Вт, ΔT60 — {configuration.q60} Вт, ΔT50 — {configuration.q50} Вт. Калькулятор использует формулу паспорта Q = Q70 × (ΔT / 70)ⁿ с n = {configuration.exponent.toLocaleString("ru-RU")}. Каталожные ΔT50/60 могут отличаться от пересчета по этой формуле.</p>

      <div class="mt-6 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
        <div class="mb-2 flex items-center justify-between text-sm text-neutral-600">
          <span>ΔT, °C</span>
          <span class="font-semibold text-neutral-800">{dt.toLocaleString("ru-RU")}°</span>
        </div>

        <label class="sr-only" for="delta-t-value">Разница температур ΔT, °C</label>
        <input id="delta-t-value"
          class="w-full accent-red-700"
          type="range"
          min={MIN_DT}
          max={MAX_DT}
          step={0.5}
          value={dt}
          onInput={(event) =>
            setDt(Number((event.currentTarget as HTMLInputElement).value))
          }
        />
        <div class="mt-1 flex justify-between text-xs text-neutral-600">
          <span>{MIN_DT}°</span>
          <span>{MAX_DT}°</span>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        {[{ label: '80/60/20 → ΔT50', value: 50 }, { label: '70/55/20 → ΔT42,5', value: 42.5 }, { label: '55/45/20 → ΔT30', value: 30 }].map(preset => <button type="button" class="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" onClick={() => setDt(preset.value)}>{preset.label}</button>)}
      </div>

      <div class="mt-5 rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <div class="text-sm text-neutral-600">
          Ориентировочная теплоотдача при текущем ΔT
        </div>
        <div class="mt-1 text-3xl font-semibold text-neutral-900" role="status" aria-live="polite">
          {formattedPower} Вт
        </div>
      </div>
      {dt < 50 && <p role="note" class="mt-4 text-sm leading-6 text-neutral-700">При ΔT ниже 50°C результат оценочный: пересчет выполнен по коэффициенту n из паспорта выбранной модели. Для заказа подтвердите мощность у производителя или проектировщика.</p>}

      <div class="mt-4 text-xs text-neutral-600">
        Расчет справочный, по формуле <a href={configuration.passportUrl} class="text-red-700 underline decoration-red-300 underline-offset-2">паспорта выбранной модели</a>. Он не рассчитывает теплопотери комнаты. Реальная теплоотдача зависит от температур системы, расхода
        теплоносителя, схемы подключения и условий установки.
      </div>
    </section>
  );
}
