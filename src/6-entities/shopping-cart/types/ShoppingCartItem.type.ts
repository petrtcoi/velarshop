type ShoppingCartItemType = 'radiator' | 'item'


type ShoppingCartItem = {
  title: string
  details: string
  qnty: number
  price: number
  linkSlug: string
  itemType: ShoppingCartItemType
}

export type { ShoppingCartItem, ShoppingCartItemType }