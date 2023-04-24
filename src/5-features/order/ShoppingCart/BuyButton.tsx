import { useStore } from "@nanostores/preact"
import { addToCart, removeFromCart, storeShoppingCart } from "@features/order/ShoppingCart"

import type { ModelJson } from "@entities/Model"
import type { RadiatorJson } from "@entities/Radiator"
import type { ItemJson } from "@entities/Item"


type BtnType = 'small' | 'large'
type PropsTiny = {
  type?: BtnType
  itemTitle: string
}
type PropsFullRadiator = {
  type?: BtnType
  itemTitle: string
  price: number
  model: Pick<ModelJson, 'type' | 'orientation' | 'slug'>
  radiator: RadiatorJson
}
type PropsFullItem = {
  type?: BtnType
  itemTitle: string
  price: number
  item: ItemJson
}
function isPropsFullRadiator (props: PropsTiny | PropsFullRadiator | PropsFullItem): props is PropsFullRadiator {
  return ('price' in props && 'model' in props)
}
function isPropsFullItem (props: PropsTiny | PropsFullRadiator | PropsFullItem): props is PropsFullItem {
  return ('price' in props && 'item' in props)
}


const smallBtnCls = "py-1 px-2 border rounded-md border-neutral-200 hover:border-neutral-400 transition-colors"
const largeBtnCls = "py-2 px-4 border rounded-md bg-transparent border-red-600 border hover:bg-red-600 text-red-600 hover:text-white transition-colors duration-300"
const largeQntyCls = "text-3xl font-mono mx-6"


function BuyButton (props: PropsTiny | PropsFullRadiator | PropsFullItem) {

  const { itemTitle, type = 'small' } = props
  const shoppingCart = useStore(storeShoppingCart)
  const itemInCartQnty = shoppingCart.items.find(item => item.title === itemTitle)?.qnty || 0

  const btnCls = type === 'small' ? smallBtnCls : largeBtnCls
  const qntyCls = type === 'small' ? '' : largeQntyCls

  const linkSlug =
    isPropsFullRadiator(props)
      ? `/model/${ props.model.slug }/${ props.radiator.slug }`
      : isPropsFullItem(props)
        ? `/item/${ props.item.slug }`
        : '/'


  const itemPrice =
    (isPropsFullRadiator(props) || isPropsFullItem(props))
      ? props.price : undefined


  const details = isPropsFullRadiator(props)
    ? `${ props.radiator.height }x${ props.radiator.length }x${ props.radiator.width } / ${ props.radiator.dt70 } Вт`
    : undefined

  const itemType = isPropsFullRadiator(props)
    ? 'radiator'
    : isPropsFullItem(props)
      ? 'item'
      : undefined


  const handleAddToCart = () => {
    console.log('props', props)
    addToCart({
      title: itemTitle,
      price: itemPrice,
      details,
      linkSlug,
      itemType
    })
  }
  const handleRemoveFromCart = () => {
    removeFromCart({
      title: itemTitle,
    })
  }




  if (itemInCartQnty > 0) {
    return (
      <div class="flex flex-row justify-between items-center">
        <button
          class={ btnCls }
          aria-label="Добавить в корзину 1 шт"
          onClick={ () => handleAddToCart() }
        >
          +
        </button>
        <div class={ qntyCls }>{ itemInCartQnty }</div>
        <button
          class={ btnCls }
          aria-label="Убрать из корзины 1 шт"
          onClick={ () => handleRemoveFromCart() }
        >
          -
        </button>
      </div>
    )
  }

  return (
    <button
      class={ `${ btnCls } w-full sm:w-48` }
      aria-label="Купить"
      onClick={ () => handleAddToCart() }
    >
      купить
    </button>
  )

}


export default BuyButton




