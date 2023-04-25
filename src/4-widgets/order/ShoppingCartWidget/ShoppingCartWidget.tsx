import { useStore } from "@nanostores/preact"
import { storeCartTotalPrice, storeCartTotalQnty, storeUniqueItemsQnty } from "@features/order/ShoppingCart"

function ShoppingCartWidget () {

  const cartTotalPrice = useStore(storeCartTotalPrice)
  const cartTotalQnty = useStore(storeCartTotalQnty)
  const uniqueItemsQnty = useStore(storeUniqueItemsQnty)

  const qntyPostfix =
    cartTotalQnty === 1
      ? 'товар'
      : cartTotalQnty < 5
        ? 'товара'
        : 'товаров'

  const uniquesPostfix =
    cartTotalQnty === 1
      ? 'наименование'
      : cartTotalQnty < 5
        ? 'наименование'
        : 'наименований'

  if (uniqueItemsQnty <= 0) return null

  return (
    <a href="/cart" aria-label="Перейти в корзину покупок" aria-live="polite" rel="nofollow">
      <div class='fixed bottom-0 right-0 pr-6 h-[60px]  rounded-tl-[50px] bg-teal-600 flex flex-row gap-2 items-center pl-[30px] cursor-pointer  group hover:shadow-2xl hover:shadow-teal-800 hover:bg-teal-700 transition-all'>
        <ShoppingCartIcon />
        <div class="flex flex-col justify-start ">
          <div class="text-xs font-thin text-neutral-100 group-hover:text-white transition-colors">в корзине { cartTotalQnty } { qntyPostfix }</div>
          <div class=" text-xs font-thin text-neutral-100 group-hover:text-white transition-colors">{ uniqueItemsQnty } { uniquesPostfix }</div>
          <div class=" text-xs font-thin text-neutral-100 group-hover:text-white transition-colors">на сумму { cartTotalPrice.toLocaleString() } &#8381;</div>
        </div>
      </div>
    </a>
  )

}

export default ShoppingCartWidget


function ShoppingCartIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={ 1.5 } stroke="currentColor" className="w-6 h-6 text-neutral-100 group-hover:text-white transition-colors">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>

  )
}