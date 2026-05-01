import { useMemo, useState } from "preact/hooks";

type PanelType = "11" | "22" | "33";
type PanelHeight = 300 | 400 | 500 | 600;

type VelarModel = {
  id: string;
  title: string;
  height: number;
  depth: number;
  wattsPerSection: number;
  sectionLength: number;
  lengthOffset: number;
  note?: string;
};

const PANEL_TYPES: PanelType[] = ["11", "22", "33"];

const PANEL_LENGTHS = [
  400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600,
];
const PANEL_HEIGHTS: PanelHeight[] = [300, 400, 500, 600];

const PANEL_POWER_TABLE_BY_TYPE: Record<
  PanelType,
  Record<PanelHeight, Record<number, number>>
> = {
  "11": {
    300: {
      400: 308,
      500: 386,
      600: 463,
      700: 540,
      800: 617,
      900: 694,
      1000: 771,
      1100: 848,
      1200: 925,
      1300: 1002,
      1400: 1079,
      1500: 1157,
      1600: 1234,
    },
    400: {
      400: 398,
      500: 498,
      600: 597,
      700: 697,
      800: 797,
      900: 896,
      1000: 996,
      1100: 1095,
      1200: 1195,
      1300: 1294,
      1400: 1394,
      1500: 1493,
      1600: 1593,
    },
    500: {
      400: 478,
      500: 598,
      600: 717,
      700: 837,
      800: 957,
      900: 1076,
      1000: 1196,
      1100: 1316,
      1200: 1435,
      1300: 1555,
      1400: 1674,
      1500: 1794,
      1600: 1914,
    },
    600: {
      400: 554,
      500: 693,
      600: 832,
      700: 970,
      800: 1109,
      900: 1247,
      1000: 1386,
      1100: 1525,
      1200: 1663,
      1300: 1802,
      1400: 1940,
      1500: 2079,
      1600: 2218,
    },
  },
  "22": {
    300: {
      400: 559,
      500: 699,
      600: 838,
      700: 978,
      800: 1118,
      900: 1257,
      1000: 1397,
      1100: 1537,
      1200: 1676,
      1300: 1816,
      1400: 1956,
      1500: 2096,
      1600: 2235,
    },
    400: {
      400: 728,
      500: 910,
      600: 1092,
      700: 1274,
      800: 1456,
      900: 1638,
      1000: 1820,
      1100: 2002,
      1200: 2184,
      1300: 2366,
      1400: 2548,
      1500: 2730,
      1600: 2912,
    },
    500: {
      400: 882,
      500: 1103,
      600: 1323,
      700: 1544,
      800: 1764,
      900: 1985,
      1000: 2205,
      1100: 2426,
      1200: 2646,
      1300: 2867,
      1400: 3087,
      1500: 3308,
      1600: 3528,
    },
    600: {
      400: 1028,
      500: 1286,
      600: 1543,
      700: 1800,
      800: 2057,
      900: 2314,
      1000: 2571,
      1100: 2828,
      1200: 3085,
      1300: 3342,
      1400: 3599,
      1500: 3857,
      1600: 4114,
    },
  },
  "33": {
    300: {
      400: 809,
      500: 1011,
      600: 1213,
      700: 1415,
      800: 1618,
      900: 1820,
      1000: 2022,
      1100: 2224,
      1200: 2426,
      1300: 2629,
      1400: 2831,
      1500: 3033,
      1600: 3235,
    },
    400: {
      400: 1038,
      500: 1298,
      600: 1558,
      700: 1817,
      800: 2077,
      900: 2336,
      1000: 2596,
      1100: 2855,
      1200: 3115,
      1300: 3375,
      1400: 3634,
      1500: 3894,
      1600: 4153,
    },
    500: {
      400: 1220,
      500: 1525,
      600: 1830,
      700: 2135,
      800: 2440,
      900: 2745,
      1000: 3050,
      1100: 3355,
      1200: 3660,
      1300: 3965,
      1400: 4270,
      1500: 4575,
      1600: 4880,
    },
    600: {
      400: 1389,
      500: 1736,
      600: 2083,
      700: 2430,
      800: 2778,
      900: 3125,
      1000: 3472,
      1100: 3819,
      1200: 4166,
      1300: 4514,
      1400: 4861,
      1500: 5208,
      1600: 5555,
    },
  },
};

const VELAR_MODELS: VelarModel[] = [
  {
    id: "2057",
    title: "Velar 2057 (2-трубчатый, горизонтальный)",
    height: 576,
    depth: 70,
    wattsPerSection: 77,
    sectionLength: 45,
    lengthOffset: 38,
  },
  {
    id: "3057",
    title: "Velar 3057 (3-трубчатый, горизонтальный)",
    height: 576,
    depth: 100,
    wattsPerSection: 90,
    sectionLength: 45,
    lengthOffset: 38,
  },
  {
    id: "4050",
    title: "Velar 4050 (4-трубчатый, горизонтальный)",
    height: 500,
    depth: 140,
    wattsPerSection: 105,
    sectionLength: 45,
    lengthOffset: 38,
  },
  {
    id: "2180",
    title: "Velar 2180 (2-трубчатый, вертикальный)",
    height: 1800,
    depth: 70,
    wattsPerSection: 225,
    sectionLength: 45,
    lengthOffset: 38,
  },
  {
    id: "3180",
    title: "Velar 3180 (3-трубчатый, вертикальный)",
    height: 1800,
    depth: 100,
    wattsPerSection: 263,
    sectionLength: 45,
    lengthOffset: 38,
  },
  {
    id: "4180",
    title: "Velar 4180 (4-трубчатый, вертикальный)",
    height: 1800,
    depth: 140,
    wattsPerSection: 337,
    sectionLength: 45,
    lengthOffset: 38,
  },
];

function PanelToVelarCalculator() {
  const [panelType, setPanelType] = useState<PanelType>("22");
  const [panelHeight, setPanelHeight] = useState<PanelHeight>(500);
  const [panelLength, setPanelLength] = useState<number>(1000);

  const panelPower = useMemo(() => {
    return PANEL_POWER_TABLE_BY_TYPE[panelType][panelHeight][panelLength] || 0;
  }, [panelType, panelHeight, panelLength]);

  const sectionResults = useMemo(() => {
    return VELAR_MODELS.map((model) => {
      const sections = Math.ceil(panelPower / model.wattsPerSection);
      const totalPower = sections * model.wattsPerSection;
      const totalLength = sections * model.sectionLength + model.lengthOffset;

      return {
        model,
        sections,
        totalPower,
        totalLength,
      };
    });
  }, [panelPower]);

  return (
    <section class="not-prose my-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-6">
      <h3 class="mt-0 mb-4 text-xl font-semibold">
        Калькулятор замены Royal Thermo Ventil Compact на Velar
      </h3>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="block">
          <div class="mb-1 text-sm text-neutral-600">Тип панели</div>
          <select
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
            value={panelType}
            onChange={(e) =>
              setPanelType((e.target as HTMLSelectElement).value as PanelType)
            }
          >
            {PANEL_TYPES.map((type) => (
              <option key={type} value={type}>
                Royal Thermo тип {type}
              </option>
            ))}
          </select>
        </label>

        <label class="block">
          <div class="mb-1 text-sm text-neutral-600">Высота, мм</div>
          <select
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
            value={panelHeight}
            onChange={(e) =>
              setPanelHeight(
                parseInt((e.target as HTMLSelectElement).value) as PanelHeight
              )
            }
          >
            {PANEL_HEIGHTS.map((height) => (
              <option key={height} value={height}>
                {height}
              </option>
            ))}
          </select>
        </label>

        <label class="block">
          <div class="mb-1 text-sm text-neutral-600">Длина, мм</div>
          <select
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
            value={panelLength}
            onChange={(e) =>
              setPanelLength(parseInt((e.target as HTMLSelectElement).value))
            }
          >
            {PANEL_LENGTHS.map((length) => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div class="mt-4 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
        <div class="text-sm text-neutral-600">Теплоотдача панели (ΔT=70°C)</div>
        <div class="text-2xl font-bold text-neutral-900">
          {panelPower.toLocaleString("ru-RU")} Вт
        </div>
        <div class="mt-1 text-sm text-neutral-600">
          Royal Thermo Ventil Compact тип {panelType}, {panelLength}x
          {panelHeight} мм
        </div>
      </div>

      <div class="mt-5 overflow-x-auto rounded-xl bg-white ring-1 ring-neutral-200">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="bg-neutral-100 text-left">
              <th class="px-3 py-2 font-semibold">Модель Velar</th>
              <th class="px-3 py-2 font-semibold">Нужно секций</th>
              <th class="px-3 py-2 font-semibold">Итоговая мощность</th>
              <th class="px-3 py-2 font-semibold">Длина (оценка)</th>
            </tr>
          </thead>
          <tbody>
            {sectionResults.map((result) => (
              <tr key={result.model.id} class="border-t border-neutral-200">
                <td class="px-3 py-2">
                  <a
                    href={`/columns/${result.model.id}`}
                    class="text-red-500 underline hover:no-underline"
                  >
                    {result.model.id}
                  </a>
                </td>
                <td class="px-3 py-2 font-semibold">{result.sections}</td>
                <td class="px-3 py-2">
                  {result.totalPower.toLocaleString("ru-RU")} Вт
                </td>
                <td class="px-3 py-2">{result.totalLength} мм</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="mt-6 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
        <h4 class="mt-0 mb-3 text-base font-semibold">
          Характеристики моделей Velar
        </h4>
        <ul class="m-0 space-y-2 pl-5 text-sm text-neutral-700">
          {VELAR_MODELS.map((model) => (
            <li key={model.id}>
              <span class="font-semibold">{model.id}</span>: {model.title};
              высота {model.height} мм; глубина {model.depth} мм;{" "}
              {model.wattsPerSection} Вт/секция; длина = секции x{" "}
              {model.sectionLength} мм + {model.lengthOffset} мм.
              {model.note ? ` ${model.note}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PanelToVelarCalculator;
