
import { getOrderConfirmationEmailText } from "./utils/getOrderConformationEmailText"
import { API_URL } from "./config/apiUrl"
import type { ConfirmationFormData } from "./types/ConfirmationFormData.type"

type Props = {
  formData: ConfirmationFormData
}

const sendOrderConfirmation = async ({ formData }: Props): Promise<'ok' | 'error'> => {

  const text = getOrderConfirmationEmailText({ formData })
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'order', customerEmail: formData.email, text })
    })
    return response.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}

export default sendOrderConfirmation
