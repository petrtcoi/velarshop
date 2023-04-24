import type { ShoppingCartItemType } from "@entities/shopping-cart"
import { storeShoppingCart } from "../store/shoppingCart"

type PropsTiny = {
  title: string
}
type PropsFull = {
  title: string
  price: number
  details: string
  linkSlug: string
  itemType?: ShoppingCartItemType
}
function isPropsFull (props: PropsTiny | PropsFull): props is PropsFull {
  return (props as PropsFull).price !== undefined
}

function addToCart (newItem: PropsTiny | PropsFull): void {
  const shoppingCart = storeShoppingCart.get()
  const itemIndex = shoppingCart.items.findIndex(item => item.title === newItem.title)

  console.log('newItem', newItem)
  if (itemIndex === -1 && isPropsFull(newItem)) {
    const itemType = newItem.itemType ? newItem.itemType : 'radiator'
    storeShoppingCart.set({
      items: [ ...shoppingCart.items, { ...newItem, qnty: 1, itemType } ]
    })
    return
  }

  storeShoppingCart.set({
    items: shoppingCart.items.map((item, index) => {
      if (index !== itemIndex) return item
      return { ...item, qnty: item.qnty + 1 }
    })
  })
}

export { addToCart }