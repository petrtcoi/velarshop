import { storeCartTotalPrice, storeShoppingCart } from '@features/order/ShoppingCart'
import { contacts } from '@shared/constants/contacts'
import type { ConfirmationFormData } from '../types/ConfirmationFormData.type'


type Props = {
  formData: ConfirmationFormData
}


const getOrderConfirmationEmailHtml = ({ formData }: Props): string =>
{

  const { items } = storeShoppingCart.get()
  const cartTotalPrice = storeCartTotalPrice.get()



  let html = ''
  html += '<h2>Ваш запрос принят</h2>'
  html += '<p>Спасибо за ваш запрос в нашем магазине'

  html += '<br/>Мы свяжемся с вами в ближайшее время для уточнения деталей и согласования заказа.</p>'

  html += '<h3>Детали заказа</h3>'
  // html += '<ul>'
  if (formData.name.length) html += `<span style="white-space:pre">Имя:&#9; ${ formData.name }</span><br>`
  if (formData.city.length) html += `<span style="white-space:pre">Город:&#9; ${ formData.city }</span><br>`
  if (formData.phone?.length) html += `<span style="white-space:pre">Тел:&#9;&#9; ${ formData.phone }</span><br>`
  if (formData.email?.length) html += `<span style="white-space:pre">Email:&#9; ${ formData.email }</span><br>`
  // html += '</ul>'
  if (formData.comments?.length) html += `<p>Комментарий к заказу:<br/>${ formData.comments }</p>`

  if (items.length > 0) html += `<h3>Заказ</h3><table border="1" cellpadding="5" cellspacing="0"><thead><td>№</td><td>Наименование</td><td>Цена</td><td>Кол-во</td><td>Сумма</td></thead><tbody>`
  items.forEach((item, index) =>
  {
    html += `<tr><td>${ index + 1 }</td><td>${ item.title }</td><td>${ item.price.toLocaleString() } руб.</td><td>${ item.qnty }</td><td>${ (item.price * item.qnty).toLocaleString() } руб.</td></tr>`
  })



  if (items.length > 0) html += '</tbody></table>'

  if (items.length > 0) html += `<p>Итого: <strong>${ cartTotalPrice.toLocaleString() } руб.</strong></p > `

  html += `< br/><br/><hr/ > <p>С уважением, <br/>Магазин дизайн-радиаторов Velar - velarshop.ru<br/ > <br/>сайт: ${ contacts.website }<br/ > тел.: +7 ${ contacts.phone495String } <br/>тел.: +7 ${ contacts.phone812String }<br/ > email: ${ contacts.email } </p>`
  html += '<img src="https://velarshop.ru/images/logo.jpg" height="50px" width="auto"/>'

  return html

}

export { getOrderConfirmationEmailHtml }