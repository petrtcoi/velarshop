import { storeCartTotalPrice, storeShoppingCart } from '@features/order/ShoppingCart'
import { contacts } from '@shared/constants/contacts'
import type { ConfirmationFormData } from '../types/ConfirmationFormData.type'


type Props = {
  formData: ConfirmationFormData
}


const getOrderConfirmationEmailText = ({ formData }: Props): string =>
{

  const { items } = storeShoppingCart.get()
  const cartTotalPrice = storeCartTotalPrice.get()

  let text = 'Спасибо за ваш запрос в нашем магазине\n'

  text += 'Мы свяжемся с вами в ближайшее время для уточнения деталей и согласования заказа.'
  text += '\n\n\n'
  text += 'ДЕТАЛИ ЗАКАЗА:'
  text += '\n\n'
  if (formData.name.length) text += `Имя:\t ${ formData.name }\n`
  if (formData.city.length) text += `Город:\t ${ formData.city }\n`
  if (formData.phone?.length) text += `Тел:\t\t ${ formData.phone }\n`
  if (formData.email?.length) text += `Email:\t ${ formData.email }\n`
  if (formData.comments?.length) text += `Комментарий: ${ formData.comments }\n`

  if (items.length > 0) text += `\n\nЗАКАЗ:\n\n`
  items.forEach((item, index) =>
  {
    text += `${ index + 1 }. ${ item.title } \nцена: ${ item.price.toLocaleString() } руб. \nкол-во: ${ item.qnty } шт \nсумма: ${ (item.price * item.qnty).toLocaleString() } руб.\n\n`
  })



  if (items.length > 0) text += `\nИтого: ${ cartTotalPrice.toLocaleString() } руб.\n\n`

  text += `С уважением,\nМагазин дизайн-радиаторов Velar - velarshop.ru\n${ contacts.website }\nтел.: +7 ${ contacts.phone495String }\nтел.: +7 ${ contacts.phone812String }`

  return text

}

export { getOrderConfirmationEmailText }