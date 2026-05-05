import { useStore } from "@nanostores/preact"
import { storeShoppingCart } from '@features/order/ShoppingCart'
import ShoppingCartListHeader from "./ShoppingCartListHeader"
import ShoppingCartRow from "./ShoppingCartRow"
import ShoppingCartListFooter from "./ShoppingCartListFooter"

function ShoppingCartList () {

  const shoppingCart = useStore(storeShoppingCart)

  if (shoppingCart.items.length === 0) return (
    <div class="min-w-0 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-center shadow-sm">
      <h2 class="m-0 text-2xl font-semibold tracking-tight text-neutral-950">Корзина пуста</h2>
      <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600">
        Вы пока не добавили товары в заявку. Перейдите в каталог и выберите подходящие модели радиаторов или конвекторов.
      </p>
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="/design" class="inline-flex h-10 items-center justify-center rounded-md bg-[#c1121f] px-5 text-sm font-medium text-white no-underline transition hover:bg-[#991b1b]">
          Перейти в каталог
        </a>
        <a href="/convector" class="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 px-5 text-sm font-medium text-neutral-900 no-underline transition hover:border-neutral-950 hover:bg-neutral-50">
          Внутрипольные конвекторы
        </a>
      </div>
    </div>
  )

  return (
    <section class="min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto">
      <div class="border-b border-neutral-200 px-4 py-4 md:px-5">
        <h2 class="m-0 text-xl font-semibold tracking-tight text-neutral-950">Выбранные позиции</h2>
        <p class="mt-1 text-sm text-neutral-600">Проверьте количество и состав заявки перед отправкой.</p>
      </div>
      <div class="max-w-full overflow-x-auto">
      <table class="w-full min-w-[590px] text-left text-sm">
        <ShoppingCartListHeader />
        <tbody>
          { shoppingCart.items
            .sort((a, b) => a.itemType === 'radiator' && b.itemType !== 'radiator' ? -1 : 1)
            .map((item) => {
              return (
                <ShoppingCartRow { ...item } />
              )
            }) }
        </tbody>
        <ShoppingCartListFooter />
      </table>
      </div>
    </section>
  )


}

export default ShoppingCartList
