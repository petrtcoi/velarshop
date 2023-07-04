export type RadiatorConnection = {
  id: string
  code: string
  description: string
}

export type ColumnRadiatorConnection = RadiatorConnection & {
  priceRub: number
}
