import type { ColumnRadiatorConnection } from "../types/RadiatorConnection.type"

export const columnConnections: ColumnRadiatorConnection[] = [
  {
    id: "lat1/2",
    code: "БОК 1/2",
    description: "Боковое подключение 1/2",
    priceRub: 0,
  },
  {
    id: "lat3/4",
    code: "БОК 3/4",
    description: "Боковое подключение 3/4",
    priceRub: 0,
  },
  {
    id: "b50",
    code: "B50 1/2",
    description: "Нижнее одностороннее 50 мм",
    priceRub: 5000,
  },
  {
    id: "blr",
    code: "BLR 1/2",
    description: "Нижнее разностороннее",
    priceRub: 5000,
  },
  {
    id: "v50",
    code: "V50 1/2",
    description: "Нижнее одностороннее 50 мм c термовентилем",
    priceRub: 7500,
  },
  {
    id: "vlr",
    code: "VLR 1/2",
    description: "Нижнее разностороннее с термовентилем",
    priceRub: 7500,
  },
]
