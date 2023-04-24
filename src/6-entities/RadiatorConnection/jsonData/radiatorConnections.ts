import type { RadiatorConnection } from "../types/RadiatorConnection.type"

const radiatorConnections: RadiatorConnection[] = [
  {
    id: 'lat',
    code: 'БОК',
    description: 'Боковое подключение'
  },
  {
    id: 'l50',
    code: 'Л50',
    description: 'Нижнее левое под бинокль межосевое 50 мм'
  },
  {
    id: 'r50',
    code: 'П50',
    description: 'Нижнее правое под бинокль межосевое 50 мм'
  },
  {
    id: '050',
    code: '050',
    description: 'Нижнее  под бинокль по центру межосевое 50 мм'
  },
  {
    id: 'lr',
    code: 'ЛП',
    description: 'Нижнее подключение справа и слева (левое-правое)'
  },
]


export { radiatorConnections }
