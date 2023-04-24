import { storeShoppingCart } from "../store/shoppingCart"

type Props = {
  title: string
}


function removeFromCart (newItem: Props): void {
  const shoppingCart = storeShoppingCart.get()
  const itemIndex = shoppingCart.items.findIndex(item => item.title === newItem.title)

  if (itemIndex === -1) return


  storeShoppingCart.set({
    items: shoppingCart.items
      .map((item, index) => (index !== itemIndex) ? item : { ...item, qnty: item.qnty - 1 })
      .filter((item) => item.qnty > 0)
  })
}

export { removeFromCart }