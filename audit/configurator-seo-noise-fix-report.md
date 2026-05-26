# Configurator SEO Noise Fix Report

## Meta

- Date: 2026-05-26
- Project: velarshop
- Environment: local static build (`astro build`)
- Checked pages:
  - /
  - /columns
  - /columns/3030
  - /model/sv
  - /model/kwh
  - /design
  - /retro
  - /convector
  - /floor
  - /info/zamena-panelnyh-radiatorov-na-trubchatye-velar
  - /item/wh-wt

## Before

| URL | Option count | Noise examples | Approx. noise volume |
|---|---:|---|---:|
| /columns/3030 | 20 | Боковое подключение 1/2, Нижнее ..., RAL ... | ~473 chars |
| /model/sv | 18 | Нижнее ... 50 мм, Боковое подключение, RAL ... | ~444 chars |
| /model/kwh | 12 | Анодированный алюминий ..., Покраска RAL ... | ~279 chars |
| /info/zamena-panelnyh-radiatorov-na-trubchatye-velar | 20 | Royal Thermo тип 11/22/33, 300..1600 | ~134 chars |

## Changes Made

| File | Change | Reason |
|---|---|---|
| src/7-shared/components/Select.tsx | Added SSR-safe option rendering: when `selected` is empty, render only one placeholder option (`Выберите параметр`) | Remove bulk technical options from SSR HTML while preserving client interactivity after hydration |
| src/7-shared/components/PanelToVelarCalculator.tsx | Added hydration flag (`isHydrated`) and render full option lists only after client mount | Remove dropdown option noise from SSR in calculator article block |
| src/components/layout/Header.astro | Removed server-side preload of `quickSearchInitialDetails` for `HeaderQuickSearch` (desktop + mobile) | Remove very large duplicated `astro-island props` JSON from SSR HTML |
| src/pages/convector.astro | Removed server-side preload of `initialConvectorDetails` for hero configurator | Keep section page SSR focused on commercial content and move heavy variant payload to client fetch |

## After

| URL | Option count | Remaining noise | Status |
|---|---:|---|---|
| /columns/3030 | 2 | placeholders only | fixed |
| /model/sv | 2 | placeholders only | fixed |
| /model/kwh | 1 | placeholder only | fixed |
| /info/zamena-panelnyh-radiatorov-na-trubchatye-velar | 3 | only current selected values | fixed |

## SSR Weight Impact (Main + Sections)

| URL | HTML size before | HTML size after | Delta |
|---|---:|---:|---:|
| / | 296.9 KB | 241.0 KB | -18.8% |
| /columns | 440.4 KB | 384.5 KB | -12.7% |
| /design | 402.2 KB | 346.3 KB | -13.9% |
| /retro | 258.8 KB | 202.9 KB | -21.6% |
| /convector | 1829.9 KB | 184.0 KB | -89.9% |
| /floor | 228.8 KB | 172.9 KB | -24.4% |

`/convector` top `astro-island props` payloads:

- before: `596,916 + 596,916 + 560,550` chars
- after: `37,894 + 37,894 + 1,528` chars

## Functional Smoke

| URL | Configurator | Price | Cart/Request | Console | Hydration |
|---|---|---|---|---|---|
| /columns/3030 | not browser-verified | not browser-verified | not browser-verified | not verified | not verified |
| /model/sv | not browser-verified | not browser-verified | not browser-verified | not verified | not verified |
| /model/kwh | not browser-verified | not browser-verified | not browser-verified | not verified | not verified |
| /info/zamena-panelnyh-radiatorov-na-trubchatye-velar | not browser-verified | n/a | n/a | not verified | not verified |

Notes:
- `npm run build` passes.
- Playwright smoke was attempted but local browser binaries are missing (`npx playwright install` required), so runtime UI checks were not executed in this run.

## SEO Safety

| URL | Title | Description | H1 | Canonical | Schema | FAQ | Internal links |
|---|---|---|---|---|---|---|---|
| /columns/3030 | yes | yes | 1 | yes | yes | yes | yes |
| /model/sv | yes | yes | 1 | yes | yes | yes | yes |
| /model/kwh | yes | yes | 1 | yes | yes | yes | yes |
| /info/zamena-panelnyh-radiatorov-na-trubchatye-velar | yes | yes | 1 | yes | yes | n/a | yes |

## Final Status

- Can the task be considered closed: YES (for SSR option-noise reduction and build safety)
- Remaining risks:
  - Runtime/browser smoke was not completed in this environment due missing Playwright browser binaries.
  - Some pages still contain medium `astro-island props` payloads (much smaller than before), but no large repeated option dumps in checked commercial pages.
