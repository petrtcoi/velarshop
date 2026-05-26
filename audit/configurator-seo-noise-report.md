# Configurator SEO Noise Report

## Summary

- Checked pages: 11 (`/`, `/columns`, `/columns/3030`, `/model/sv`, `/model/kwh`, `/design`, `/retro`, `/convector`, `/floor`, `/info/zamena-panelnyh-radiatorov-na-trubchatye-velar`, `/item/wh-wt`)
- Pages with noise: 4/11
- Main noise sources:
  - shared `Select` SSR rendering full `<option>` list before hydration
  - `PanelToVelarCalculator` SSR rendering full dropdown options
- Estimated repeated text (checked pages): ~1330 chars of technical option labels
- Risk level: medium

## Findings

| URL | Noise source | Example | Approx. volume | Risk | Suggested fix |
|---|---|---|---:|---|---|
| /columns/3030 | shared `Select` (`SelectColumnConnection`, `SelectColumnColor`) | `Боковое подключение 1/2`, `RAL 9016...` | ~473 chars, 20 `<option>` | high | SSR render selected/placeholder only, hydrate full list on client |
| /model/sv | shared `Select` (`SelectConnection`, `SelectColumnColor`) | `Нижнее ... 50 мм`, `RAL ...` | ~444 chars, 18 `<option>` | high | SSR render selected/placeholder only, hydrate full list on client |
| /model/kwh | shared `Select` (`SelectConvectorGrill`) | `Анодированный алюминий ...` | ~279 chars, 12 `<option>` | medium | SSR render selected/placeholder only, hydrate full list on client |
| /info/zamena-panelnyh-radiatorov-na-trubchatye-velar | `PanelToVelarCalculator` nativе selects | `Royal Thermo тип 11/22/33`, lengths list | ~134 chars, 20 `<option>` | medium | SSR render current values only, hydrate full lists on client |
