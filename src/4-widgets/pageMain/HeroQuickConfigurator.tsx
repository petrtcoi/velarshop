import { addToCart, removeFromCart, storeShoppingCart } from "@features/order/ShoppingCart";
import { useStore } from "@nanostores/preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

type ModelType = "design" | "floor" | "convector" | "ironcast" | "columns";
type Orientation = "vertical" | "horizontal" | "";

type ModelOption = {
  id: string;
  slug: string;
  name: string;
  type: ModelType;
  orientation?: Orientation;
  prefix: string;
  search: string;
  href: string;
};

type SelectOption = {
  id: string;
  label: string;
  code?: string;
  priceRub?: number;
  multiplicate?: number;
  priceId?: string;
};

type Variant = {
  slug: string;
  title: string;
  height: string;
  width: string;
  length: string;
  sections?: string;
  nSpacing?: string;
  dt70?: string;
  price: string;
  addonDesignRadiatorsLegs?: string;
  addonStainlessBody?: string;
  grillPrices?: Record<string, string | undefined>;
};

type ModelDetails = {
  model: ModelOption;
  filters: {
    height: boolean;
    width: boolean;
    length: boolean;
    sections: boolean;
    tubes: boolean;
    connection: boolean;
    color: boolean;
    grill: boolean;
    addon: boolean;
  };
  options: {
    heights: string[];
    widths: string[];
    lengths: string[];
    sections: string[];
    tubes: string[];
    connections: SelectOption[];
    colors: SelectOption[];
    grills: SelectOption[];
    addon?: SelectOption;
  };
  variants: Variant[];
};

type Props = {
  models: ModelOption[];
  defaultModelId?: string;
};

type DimensionKey = "height" | "width" | "length" | "sections" | "tubes";
type Selection = Record<DimensionKey, string> & {
  connection: string;
  color: string;
  grill: string;
  addon: boolean;
};

const emptySelection: Selection = {
  height: "",
  width: "",
  length: "",
  sections: "",
  tubes: "",
  connection: "",
  color: "",
  grill: "",
  addon: false,
};

function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function parsePrice(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fieldLabelClass(): string {
  return "text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500";
}

function selectClass(): string {
  return "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";
}

function modelTypeLabel(model: Pick<ModelOption, "type" | "orientation">): string {
  if (model.type === "columns") return "Трубчатый радиатор";
  if (model.type === "convector") return "Конвектор";
  if (model.type === "floor") return "Напольный радиатор";
  if (model.type === "ironcast") return "Ретро-радиатор";
  return model.orientation === "horizontal" ? "Горизонтальный дизайн" : "Вертикальный дизайн";
}

function getVariantDimension(variant: Variant, key: DimensionKey, model?: ModelOption): string {
  if (key === "tubes") return model?.type === "columns" ? model.id.slice(0, 1) : "";
  return variant[key] ?? "";
}

function getDimensionOptions(details: ModelDetails, key: DimensionKey): string[] {
  if (key === "height") return details.options.heights;
  if (key === "width") return details.options.widths;
  if (key === "length") return details.options.lengths;
  if (key === "sections") return details.options.sections;
  return details.options.tubes;
}

function optionLabel(key: DimensionKey, value: string): string {
  if (key === "height" || key === "width" || key === "length") return `${value} мм`;
  if (key === "sections") return `${value} сек.`;
  if (key === "tubes") return `${value} трубки`;
  return value;
}

function isVariantMatch(variant: Variant, details: ModelDetails, selection: Selection): boolean {
  return (["height", "width", "length", "sections", "tubes"] as DimensionKey[]).every((key) => {
    if (!details.filters[key]) return true;
    const selected = selection[key];
    if (!selected) return true;
    return getVariantDimension(variant, key, details.model) === selected;
  });
}

function getAvailableOptions(details: ModelDetails, selection: Selection, key: DimensionKey): string[] {
  const source = getDimensionOptions(details, key);

  return source.filter((value) =>
    details.variants.some((variant) =>
      (["height", "width", "length", "sections", "tubes"] as DimensionKey[]).every((candidateKey) => {
        if (!details.filters[candidateKey]) return true;
        const selected = candidateKey === key ? value : selection[candidateKey];
        if (!selected) return true;
        return getVariantDimension(variant, candidateKey, details.model) === selected;
      })
    )
  );
}

function buildInitialSelection(details: ModelDetails): Selection {
  return {
    height: details.filters.height ? details.options.heights[0] ?? "" : "",
    width: details.filters.width ? details.options.widths[0] ?? "" : "",
    length: details.filters.length ? details.options.lengths[0] ?? "" : "",
    sections: details.filters.sections ? details.options.sections[0] ?? "" : "",
    tubes: details.filters.tubes ? details.options.tubes[0] ?? "" : "",
    connection: details.options.connections[0]?.id ?? "",
    color: details.options.colors[0]?.id ?? "",
    grill: details.options.grills[0]?.id ?? "",
    addon: false,
  };
}

function getSelectionSummary(details: ModelDetails, variant: Variant, selection: Selection): string {
  const parts = [
    details.filters.height ? `высота ${variant.height} мм` : "",
    details.filters.length ? `длина ${variant.length} мм` : "",
    details.filters.width ? `${details.model.type === "convector" ? "ширина" : "глубина"} ${variant.width} мм` : "",
    details.filters.sections && variant.sections ? `${variant.sections} сек.` : "",
    details.filters.tubes ? `${selection.tubes} трубки` : "",
    details.options.connections.find((item) => item.id === selection.connection)?.code ?? "",
    details.options.colors.find((item) => item.id === selection.color)?.label ?? "",
    details.options.grills.find((item) => item.id === selection.grill)?.code ?? "",
    selection.addon ? details.options.addon?.code ?? details.options.addon?.label ?? "" : "",
  ];

  return parts.filter(Boolean).join(" / ");
}

function getTotalPrice(details: ModelDetails, variant: Variant, selection: Selection): number {
  let price = parsePrice(variant.price);

  const color = details.options.colors.find((item) => item.id === selection.color);
  if (details.model.type === "columns" && color?.multiplicate) price *= color.multiplicate;

  const connection = details.options.connections.find((item) => item.id === selection.connection);
  price += connection?.priceRub ?? 0;

  const grill = details.options.grills.find((item) => item.id === selection.grill);
  if (grill?.priceId && grill.priceId !== "grill_empty") {
    price += parsePrice(variant.grillPrices?.[grill.priceId]);
  }

  if (selection.addon && details.options.addon?.id === "addon_design_radiators_legs") {
    price += parsePrice(variant.addonDesignRadiatorsLegs);
  }
  if (selection.addon && details.options.addon?.id === "addon_stainless_body") {
    price += parsePrice(variant.addonStainlessBody);
  }

  return Math.max(0, Math.round(price));
}

export default function HeroQuickConfigurator({ models, defaultModelId = "3030" }: Props) {
  const shoppingCart = useStore(storeShoppingCart);
  const [selectedModelId, setSelectedModelId] = useState(defaultModelId);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<ModelDetails | null>(null);
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? models[0],
    [models, selectedModelId]
  );

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return models.slice(0, 12);
    return models.filter((model) => model.search.includes(normalizedQuery)).slice(0, 18);
  }, [models, query]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!comboboxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!selectedModelId) return;
    const controller = new AbortController();

    setLoading(true);
    setError("");
    fetch(`/api/hero-configurator/${encodeURIComponent(selectedModelId)}.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить модель");
        return response.json() as Promise<ModelDetails>;
      })
      .then((payload) => {
        setDetails(payload);
        setSelection(buildInitialSelection(payload));
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") return;
        setError("Не удалось загрузить варианты. Попробуйте выбрать модель еще раз.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedModelId]);

  const matchedVariants = useMemo(() => {
    if (!details) return [];
    return details.variants.filter((variant) => isVariantMatch(variant, details, selection));
  }, [details, selection]);

  useEffect(() => {
    if (!details || matchedVariants.length > 0) return;
    const fallback = details.variants.find((variant) =>
      (["height", "width", "length", "sections", "tubes"] as DimensionKey[]).every((key) => {
        if (!details.filters[key]) return true;
        const selected = selection[key];
        if (!selected) return true;
        return getVariantDimension(variant, key, details.model) === selected;
      })
    );
    if (!fallback) return;
    setSelection((current) => ({
      ...current,
      height: details.filters.height ? fallback.height : current.height,
      width: details.filters.width ? fallback.width : current.width,
      length: details.filters.length ? fallback.length : current.length,
      sections: details.filters.sections ? fallback.sections ?? current.sections : current.sections,
      tubes: details.filters.tubes ? getVariantDimension(fallback, "tubes", details.model) : current.tubes,
    }));
  }, [details, matchedVariants.length, selection]);

  const result = matchedVariants[0];
  const totalPrice = details && result ? getTotalPrice(details, result, selection) : 0;
  const summary = details && result ? getSelectionSummary(details, result, selection) : "";
  const itemTitle = details && result ? `${result.title}${summary ? `, ${summary}` : ""}` : "";
  const itemInCartQnty = shoppingCart.items.find((item) => item.title === itemTitle)?.qnty ?? 0;

  const setDimension = (key: DimensionKey, value: string) => {
    setSelection((current) => ({ ...current, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!details || !result || !totalPrice) return;
    addToCart({
      title: itemTitle,
      price: totalPrice,
      details: `${result.height}x${result.length}x${result.width} мм${result.dt70 ? ` / ${result.dt70} Вт` : ""}`,
      linkSlug: `/model/${details.model.slug}/${result.slug}`,
      itemType: "radiator",
    });
  };

  const handleRemoveFromCart = () => {
    if (!itemTitle) return;
    removeFromCart({ title: itemTitle });
  };

  return (
    <div class="w-full max-w-[460px] rounded-[22px] border border-white/70 bg-white p-4 text-neutral-950 shadow-[0_28px_80px_rgba(0,0,0,0.30)] md:p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold tracking-[-0.02em]">Быстрый выбор</h2>
          <p class="mt-1 text-sm leading-5 text-neutral-600">Модель, параметры и добавление в корзину без перехода в каталог.</p>
        </div>
        <a href="/cart" class="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-red-200 hover:text-red-700">
          Корзина
        </a>
      </div>

      <div class="mt-4" ref={comboboxRef}>
        <label class={fieldLabelClass()} id="hero_model_label">Модель</label>
        <div class="relative mt-1.5">
          <button
            type="button"
            class="flex h-11 w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-left text-sm outline-none transition hover:border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby="hero_model_label"
            onClick={() => {
              setOpen((value) => !value);
              setQuery("");
            }}
          >
            <span class="min-w-0 truncate">
              {selectedModel ? `Velar ${selectedModel.name}` : "Выберите модель"}
            </span>
            <span class="ml-3 text-neutral-400" aria-hidden="true">⌄</span>
          </button>

          {open && (
            <div class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
              <div class="border-b border-neutral-100 p-2">
                <input
                  class="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  value={query}
                  placeholder="P30, P60, Q40, 3030, KWH..."
                  autoFocus
                  onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                />
              </div>
              <div role="listbox" class="max-h-[280px] overflow-y-auto p-1">
                {filteredModels.length === 0 ? (
                  <div class="px-3 py-4 text-sm text-neutral-500">Модель не найдена</div>
                ) : (
                  filteredModels.map((model) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={model.id === selectedModelId}
                      class={`block w-full rounded-lg px-3 py-2 text-left transition hover:bg-red-50 ${model.id === selectedModelId ? "bg-red-50 text-red-700" : "text-neutral-900"}`}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span class="block text-sm font-medium">Velar {model.name}</span>
                      <span class="mt-0.5 block text-xs text-neutral-500">{modelTypeLabel(model)} · {model.id}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <div class="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">Загружаем доступные параметры...</div>}
      {error && <div class="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {details && !loading && (
        <div class="mt-4 space-y-3">
          <div class="grid grid-cols-2 gap-2.5">
            {(["tubes", "height", "sections", "length", "width"] as DimensionKey[]).map((key) => {
              if (!details.filters[key]) return null;
              const available = getAvailableOptions(details, selection, key);
              const options = getDimensionOptions(details, key);
              const titleByKey: Record<DimensionKey, string> = {
                tubes: "Трубок",
                height: "Высота",
                sections: "Секций",
                length: "Длина",
                width: details.model.type === "convector" ? "Ширина" : "Глубина",
              };

              return (
                <div class="min-w-0">
                  <label class={fieldLabelClass()}>{titleByKey[key]}</label>
                  <select class={`${selectClass()} mt-1.5`} value={selection[key]} onChange={(event) => setDimension(key, (event.currentTarget as HTMLSelectElement).value)}>
                    {options.map((value) => (
                      <option value={value} disabled={!available.includes(value)}>{optionLabel(key, value)}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            {details.filters.connection && details.options.connections.length > 0 && (
              <div class="min-w-0">
                <label class={fieldLabelClass()}>Подключение</label>
                <select class={`${selectClass()} mt-1.5`} value={selection.connection} onChange={(event) => setSelection((current) => ({ ...current, connection: (event.currentTarget as HTMLSelectElement).value }))}>
                  {details.options.connections.map((option) => <option value={option.id}>{option.label}</option>)}
                </select>
              </div>
            )}

            {details.filters.color && details.options.colors.length > 0 && (
              <div class="min-w-0">
                <label class={fieldLabelClass()}>Цвет</label>
                <select class={`${selectClass()} mt-1.5`} value={selection.color} onChange={(event) => setSelection((current) => ({ ...current, color: (event.currentTarget as HTMLSelectElement).value }))}>
                  {details.options.colors.map((option) => <option value={option.id}>{option.label}</option>)}
                </select>
              </div>
            )}

            {details.filters.grill && details.options.grills.length > 0 && (
              <div class="min-w-0">
                <label class={fieldLabelClass()}>Решетка</label>
                <select class={`${selectClass()} mt-1.5`} value={selection.grill} onChange={(event) => setSelection((current) => ({ ...current, grill: (event.currentTarget as HTMLSelectElement).value }))}>
                  {details.options.grills.map((option) => <option value={option.id}>{option.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {details.filters.addon && details.options.addon && (
            <label class="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
              <input type="checkbox" checked={selection.addon} onChange={() => setSelection((current) => ({ ...current, addon: !current.addon }))} />
              {details.options.addon.label}
            </label>
          )}

          {result ? (
            <div class="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5">
              <div class="text-xs font-medium uppercase tracking-[0.08em] text-neutral-500">Найденный вариант</div>
              <a href={`/model/${details.model.slug}/${result.slug}`} class="mt-1.5 block text-base font-semibold leading-5 text-neutral-950 hover:text-red-700 hover:underline">
                {result.title}
              </a>
              <div class="mt-2 text-xs leading-5 text-neutral-600">{summary}</div>
              <div class="mt-3 flex items-end justify-between gap-3">
                <div>
                  {totalPrice > 0 && <div class="text-2xl font-semibold tracking-[-0.03em]">{formatRub(totalPrice)}</div>}
                  {result.dt70 && <div class="mt-0.5 text-xs text-neutral-500">Мощность ΔT70: {result.dt70} Вт</div>}
                </div>
                {matchedVariants.length > 1 && (
                  <a href={details.model.href} class="text-right text-xs font-medium text-red-700 hover:underline">Показать еще {matchedVariants.length - 1} вариантов</a>
                )}
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                {itemInCartQnty > 0 ? (
                  <>
                    <button type="button" class="h-10 w-10 rounded-lg border border-neutral-300 bg-white text-lg transition hover:border-red-300 hover:text-red-700" onClick={handleRemoveFromCart} aria-label="Уменьшить количество">-</button>
                    <div class="min-w-8 text-center text-sm font-semibold">{itemInCartQnty}</div>
                    <button type="button" class="h-10 w-10 rounded-lg border border-neutral-300 bg-white text-lg transition hover:border-red-300 hover:text-red-700" onClick={handleAddToCart} aria-label="Увеличить количество">+</button>
                    <span class="text-sm font-medium text-green-700">Добавлено</span>
                  </>
                ) : (
                  <button type="button" class="h-10 flex-1 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-neutral-300" disabled={!totalPrice} onClick={handleAddToCart}>
                    Добавить в корзину
                  </button>
                )}
              </div>

              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <a href={details.model.href} class="font-medium text-neutral-700 hover:text-red-700 hover:underline">Подробнее о модели</a>
                <a href="/cart" class="font-medium text-red-700 hover:underline">Перейти в корзину</a>
              </div>
            </div>
          ) : (
            <div class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">Для выбранных параметров нет варианта. Измените один из размеров.</div>
          )}
        </div>
      )}
    </div>
  );
}
