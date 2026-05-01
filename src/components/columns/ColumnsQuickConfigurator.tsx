import { columnColors } from "@entities/ColumnsColor";
import { radiatorsJsonData } from "@entities/Radiator";
import type { ColumnRadiatorConnection } from "@entities/RadiatorConnection";
import { columnConnections } from "@entities/RadiatorConnection";
import {
  addToCart,
  removeFromCart,
  storeShoppingCart,
} from "@features/order/ShoppingCart";
import { useStore } from "@nanostores/preact";
import { useMemo, useState } from "preact/hooks";
import type { ColumnsModelCard } from "./columnsData";

type Props = {
  models: ColumnsModelCard[];
};

const DEFAULT_HEIGHT = "1800";
const DEFAULT_TUBES = "2";
const DEFAULT_SECTIONS = "6";
const DEFAULT_COLOR = "ral_9016_gloss";
const DEFAULT_CONNECTION = "lat1/2";

const tubeOptions = [
  { value: "2", label: "2 трубки" },
  { value: "3", label: "3 трубки" },
  { value: "4", label: "4 трубки" },
];

function parseNum(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionClass(active: boolean): string {
  return active
    ? "inline-flex h-8 cursor-pointer items-center justify-center rounded-[3px] border border-red-600 bg-red-50 px-2.5 text-xs font-medium text-red-700 transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-1"
    : "inline-flex h-8 cursor-pointer items-center justify-center rounded-[3px] border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-1";
}

function fieldLabelClass(): string {
  return "text-sm font-normal text-neutral-600";
}

function selectClass(): string {
  return "h-10 w-full cursor-pointer rounded-[3px] border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 outline-none transition-colors hover:border-red-300 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-100";
}

function getConnectionUiLabel(option: ColumnRadiatorConnection): string {
  const labels: Record<string, string> = {
    "lat1/2": "Боковое 1/2",
    "lat3/4": "Боковое 3/4",
    b50: "Нижнее 50 мм одностороннее",
    blr: "Нижнее разностороннее",
    с50с: "Нижнее по центру 50 мм",
    v50: "Нижнее 50 мм с термовентилем",
    vlr: "Нижнее разностороннее с термовентилем",
  };

  return labels[option.id] ?? option.description;
}

export default function ColumnsQuickConfigurator({ models }: Props) {
  const shoppingCart = useStore(storeShoppingCart);

  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [tubes, setTubes] = useState(DEFAULT_TUBES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [connection, setConnection] = useState(DEFAULT_CONNECTION);

  const sectionsOptions = useMemo(() => {
    return Array.from({ length: 27 }, (_, index) => String(index + 4));
  }, []);

  const heightOptions = useMemo(() => {
    const uniqueHeights = [
      ...new Set(
        models.map((item) => item.height).filter((value) => value > 0)
      ),
    ].sort((a, b) => a - b);

    return uniqueHeights.map((value) => ({
      value: String(value),
      label: `${value} мм`,
    }));
  }, [models]);

  const model = useMemo(() => {
    return models.find(
      (item) =>
        String(item.height) === height && String(item.tubeCount) === tubes
    );
  }, [models, height, tubes]);

  const selectedColor = useMemo(() => {
    return columnColors.find((item) => item.id === color);
  }, [color]);

  const selectedConnection = useMemo(() => {
    return columnConnections.find((item) => item.id === connection);
  }, [connection]);

  const sectionCount = Number(sections);
  const canEstimate =
    Boolean(model) && Number.isFinite(sectionCount) && sectionCount > 0;

  const matchedRadiator = useMemo(() => {
    if (!model || !Number.isFinite(sectionCount)) return undefined;
    return radiatorsJsonData.find(
      (radiator) =>
        radiator.model_id === model.id &&
        Number.parseInt(radiator.sections || "0", 10) === sectionCount
    );
  }, [model, sectionCount]);

  const basePrice = matchedRadiator ? parseNum(matchedRadiator.price) : 0;
  const colorMultiplier = selectedColor?.multiplicate ?? 1;
  const connectionPrice = selectedConnection?.priceRub ?? 0;
  const hasExactPrice = basePrice > 0;
  const estimatedPrice = hasExactPrice
    ? Math.round(basePrice * colorMultiplier + connectionPrice)
    : 0;

  const power = matchedRadiator
    ? Math.round(parseNum(matchedRadiator.dt70))
    : model
    ? Math.round(model.powerSection * sectionCount)
    : 0;

  const dimensions = matchedRadiator
    ? `${matchedRadiator.height} × ${matchedRadiator.length} × ${matchedRadiator.width} мм`
    : "н/д";

  const modelLabel = model
    ? `Velar ${model.name}`
    : "нестандартная конфигурация";
  const colorLabel = selectedColor?.shortName ?? "RAL";
  const compactColorLabel = colorLabel
    .replace(" глянец", "")
    .replace(" мат.", "");
  const connectionLabel = selectedConnection
    ? getConnectionUiLabel(selectedConnection)
    : "Подключение под проект";

  const itemTitle = `${modelLabel}, ${sectionCount} секций, ${colorLabel}, ${connectionLabel}`;
  const itemDetails = `${height} мм / ${tubes} трубки / ${connectionLabel}`;
  const itemInCartQnty =
    shoppingCart.items.find((item) => item.title === itemTitle)?.qnty ?? 0;

  const handleAddToCart = () => {
    if (!model || !estimatedPrice) return;
    addToCart({
      title: itemTitle,
      price: estimatedPrice,
      details: itemDetails,
      linkSlug: model.href,
      itemType: "radiator",
    });
  };

  const handleRemoveFromCart = () => {
    removeFromCart({ title: itemTitle });
  };

  return (
    <div class="rounded-xl border-[2px] border-neutral-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out md:p-5 md:hover:-translate-y-1 md:hover:border-neutral-300 md:hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <h2 class="text-sm font-semibold text-neutral-950">Быстрый подбор</h2>
      <p class="mt-1 text-xs leading-5 text-neutral-700">
        Выберите параметры и сразу добавьте конфигурацию в корзину.
      </p>

      <div class="mt-2.5 space-y-2.5">
        <div>
          <div class={fieldLabelClass()}>Трубок в секции</div>
          <div class="mt-1 flex flex-wrap gap-1.5">
            {tubeOptions.map((option) => (
              <button
                type="button"
                aria-pressed={tubes === option.value}
                class={optionClass(tubes === option.value)}
                onClick={() => setTubes(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <div class="min-w-0">
            <label class={fieldLabelClass()} for="columns_quick_height">
              Высота
            </label>
            <select
              id="columns_quick_height"
              class={selectClass()}
              value={height}
              onChange={(event) =>
                setHeight((event.currentTarget as HTMLSelectElement).value)
              }
            >
              {heightOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div class="min-w-0">
            <label class={fieldLabelClass()} for="columns_quick_sections">
              Секции
            </label>
            <select
              id="columns_quick_sections"
              class={selectClass()}
              value={sections}
              onChange={(event) =>
                setSections((event.currentTarget as HTMLSelectElement).value)
              }
            >
              {sectionsOptions.map((value) => (
                <option value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <div class="min-w-0">
            <label class={fieldLabelClass()} for="columns_quick_color">
              Цвет
            </label>
            <select
              id="columns_quick_color"
              class={selectClass()}
              value={color}
              onChange={(event) =>
                setColor((event.currentTarget as HTMLSelectElement).value)
              }
            >
              {columnColors.map((option) => (
                <option value={option.id}>{option.title}</option>
              ))}
            </select>
          </div>

          <div class="min-w-0">
            <label class={fieldLabelClass()} for="columns_quick_connection">
              Подключение
            </label>
            <select
              id="columns_quick_connection"
              class={selectClass()}
              value={connection}
              onChange={(event) =>
                setConnection((event.currentTarget as HTMLSelectElement).value)
              }
            >
              {columnConnections.map((option) => (
                <option value={option.id}>
                  {getConnectionUiLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div class="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <div class="text-xs text-neutral-600">Выбрано</div>
        <div class="mt-1 text-sm font-semibold text-neutral-950">
          {modelLabel} · {sectionCount} секций · {compactColorLabel} ·{" "}
          {connectionLabel.toLowerCase()}
        </div>

        <div class="mt-2.5 text-xl font-semibold text-neutral-950">
          {hasExactPrice && estimatedPrice > 0
            ? `Цена: ${estimatedPrice.toLocaleString("ru-RU")} ₽`
            : "Точную стоимость подтвердит менеджер"}
        </div>

        <dl class="mt-2.5 space-y-1 text-xs text-neutral-700">
          <div class="grid grid-cols-[auto_1fr_auto] gap-2">
            <dt>Габариты</dt>
            <dd class="border-b border-dotted border-neutral-300"></dd>
            <dd>{dimensions}</dd>
          </div>
          <div class="grid grid-cols-[auto_1fr_auto] gap-2">
            <dt>Мощность ΔT70</dt>
            <dd class="border-b border-dotted border-neutral-300"></dd>
            <dd>{power > 0 ? `${power.toLocaleString("ru-RU")} Вт` : "н/д"}</dd>
          </div>
          <div class="grid grid-cols-[auto_1fr_auto] gap-2">
            <dt>Секции</dt>
            <dd class="border-b border-dotted border-neutral-300"></dd>
            <dd>{sectionCount}</dd>
          </div>
          <div class="grid grid-cols-[auto_1fr_auto] gap-2">
            <dt>Подключение</dt>
            <dd class="border-b border-dotted border-neutral-300"></dd>
            <dd>{connectionLabel.toLowerCase()}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-3.5">
        {itemInCartQnty > 0 ? (
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[3px] border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition-colors hover:border-red-300 hover:text-red-700"
                onClick={handleRemoveFromCart}
                aria-label="Уменьшить количество"
              >
                -
              </button>
              <div class="min-w-8 text-center text-sm font-semibold text-neutral-950">
                {itemInCartQnty}
              </div>
              <button
                type="button"
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[3px] border border-neutral-300 bg-white text-sm font-medium text-neutral-900 transition-colors hover:border-red-300  hover:text-red-700"
                onClick={handleAddToCart}
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>

            <a
              href="/cart"
              class="text-sm font-medium text-red-700 transition-colors hover:text-red-800 hover:underline"
            >
              Перейти в корзину
            </a>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canEstimate || !hasExactPrice}
            class="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[3px] border border-red-700 px-4 text-sm font-medium text-red-700 transition-colors hover:border-red-800 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:opacity-70"
            onClick={handleAddToCart}
          >
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
}
