
import { getOrderConfirmationEmailText } from "./utils/getOrderConformationEmailText"
import { getOrderConfirmationEmailHtml } from "./utils/getOrderConfirmationEmailHtml"
import { API_URL } from "./config/apiUrl"
import { contacts } from "@shared/constants/contacts"
import type { ConfirmationFormData } from "./types/ConfirmationFormData.type"




type RequestProps = {
  from: string
  to: string
  bcc: string
  subject: string
  text: string
  html: string
}
type RequestResult = { data: 'ok' | 'error' }

type Props = {
  formData: ConfirmationFormData
}

const sendOrderConfirmation = async ({ formData }: Props): Promise<'ok' | 'error'> =>
{

  const text = getOrderConfirmationEmailText({ formData })
  const html = getOrderConfirmationEmailHtml({ formData })

  const data = {
    to: formData.email,
    from: contacts.emailFrom,
    subject: 'VelarShop.ru: ваш запрос принят',
    text,
    html
  }

  try
  {
    const res1 = formData.email?.length
      ? await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(data)
      })
        .then(res => res.json() as Promise<RequestResult>)
        .catch(() => ({ data: 'error' }))
      : { data: 'ok' }


    const res2 = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ ...data, to: contacts.emailNotifications })
    })
      .then(res => res.json() as Promise<RequestResult>)
      .catch(() => ({ data: 'error' }))

    return ((res1.data === 'ok' && res2.data === 'ok') ? 'ok' : 'error')
  } catch {
    return 'error'
  }
}

export default sendOrderConfirmation