import type { ShoppingCart } from "@entities/shopping-cart"
import { persistentAtom } from "@nanostores/persistent"
import { computed } from 'nanostores'

const version = await import.meta.env.PUBLIC_LOCAL_STORAGE_VERSION

const storeShoppingCart = persistentAtom<ShoppingCart>(`velarshop_shopping_cart/${ version }`, { items: [] }, {
  encode: JSON.stringify,
  decode: JSON.parse,
})

const storeCartTotalPrice = computed(storeShoppingCart, (shoppingCart) => {
  return shoppingCart.items.reduce((total, item) => total + item.price * item.qnty, 0)
})

const storeCartTotalQnty = computed(storeShoppingCart, (shoppingCart) => {
  return shoppingCart.items.reduce((total, item) => total + item.qnty, 0)
})

const storeUniqueItemsQnty = computed(storeShoppingCart, (shoppingCart) => {
  return shoppingCart.items.length
})

export {
  storeShoppingCart,
  storeCartTotalPrice,
  storeCartTotalQnty,
  storeUniqueItemsQnty
}