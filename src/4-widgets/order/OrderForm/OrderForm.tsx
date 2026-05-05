import sendOrderConfirmation from '@features/order/SendEmailOrderConfirmation/sendEmailOrderConfirmation'
import { storeShoppingCart } from '@features/order/ShoppingCart'
import { computed, signal } from '@preact/signals'

const FORM_ID = 'order-form'

type Errors = {
	name?: string
	city?: string
	contacts?: string
}

const privacyChecked = signal(false)
const termsChecked = signal(false)

const name = signal('')
const city = signal('')
const phone = signal('')
const email = signal('')
const comments = signal('')
const checkForm = signal(false)
const sendEmailError = signal('')
const fetching = signal(false)

const errors = computed(() => {
	if (!checkForm.value) return {}
	let errs: Errors = {}
	if (!name.value.trim()) errs.name = 'Пожалуйста, укажите ваше имя'
	if (!city.value.trim()) errs.city = 'Пожалуйста, укажите, куда требуется доставка'
	if (!phone.value.trim() && !email.value.trim()) errs.contacts = 'Пожалуйста, как можно с вами связаться: телефон и/или электронная почта'
	return errs
})
const isErrors = computed(() => !!Object.keys(errors.value).length)
const consentErrors = computed(() => checkForm.value && (!privacyChecked.value || !termsChecked.value))

function OrderForm() {
	const handleSubmit = async () => {
		if (!window?.location) return
		sendEmailError.value = ''
		checkForm.value = true

		if (isErrors.value || !privacyChecked.value || !termsChecked.value) {
			window.location.href = `#${FORM_ID}`
			return
		}

		fetching.value = true
		const result = await sendOrderConfirmation({
			formData: {
				name: name.value,
				city: city.value,
				phone: phone.value,
				email: email.value,
				comments: comments.value,
			},
		})
		fetching.value = false
		if (result === 'ok') {
			storeShoppingCart.set({ items: [] })
			window.location.href = '/success'
			return
		}
		sendEmailError.value = 'Во время отправки письма произошла ошибка!'
	}

	return (
		<div id={FORM_ID}>
			<h2 class='text-2xl mb-2 mt-10'>Оформление заказа</h2>
			<div class='w-full sm:w-3/4 md:w-1/2'>
				<label class='text-xs'>
					Как к вам можно обращаться:
					<input
						value={name.value}
						onChange={e => (name.value = e.currentTarget.value)}
						aria-required='true'
						aria-invalid={errors.value.name ? 'true' : 'false'}
						name='name'
						type='text'
						class='block mt-1 border border-neutral-200 py-1 px-1 rounded-lg text-base w-full aria-invalid:border-red-500'
					/>
					{errors.value.name && <p class='text-red-500 text-xs'>{errors.value.name}</p>}
				</label>
				<div class='mt-4'>
					<label class='text-xs'>
						В каком городе требуется доставка:
						<input
							value={city.value}
							onChange={e => (city.value = e.currentTarget.value)}
							aria-required='true'
							aria-invalid={errors.value.city ? 'true' : 'false'}
							name='city'
							type='text'
							class='block mt-1 border border-neutral-200 py-1 px-1 rounded-lg text-base w-full aria-invalid:border-red-500'
						/>
						{errors.value.city && <p class='text-red-500 text-xs'>{errors.value.city}</p>}
					</label>
				</div>
				<div class='mt-4'>
					<label class='text-xs'>
						Телефон:
						<input
							value={phone.value}
							onChange={e => (phone.value = e.currentTarget.value)}
							aria-invalid={errors.value.contacts ? 'true' : 'false'}
							name='phone'
							type='phone'
							class='block mt-1 border border-neutral-200 py-1 px-1 rounded-lg text-base w-full aria-invalid:border-red-500'
						/>
					</label>
				</div>
				<div class='mt-4'>
					<label class='text-xs'>
						Адрес электронной почты:
						<input
							value={email.value}
							onChange={e => (email.value = e.currentTarget.value)}
							aria-invalid={errors.value.contacts ? 'true' : 'false'}
							name='email'
							type='email'
							class='block mt-1 border border-neutral-200 py-1 px-1 rounded-lg text-base w-full aria-invalid:border-red-500'
						/>
					</label>
				</div>
				{errors.value.contacts && <p class='text-red-500 text-xs'>{errors.value.contacts}</p>}
				<div class='mt-4'>
					<label class='text-xs'>
						Комментарии:
						<textarea
							value={comments.value}
							onChange={e => (comments.value = e.currentTarget.value)}
							name='comments'
							rows={5}
							type='text'
							class='block mt-1 border border-neutral-200 py-1 px-1 rounded-lg text-base w-full'
						/>
					</label>
				</div>

				<div class={`mt-6 mb-6 rounded-[18px] border p-4 ${consentErrors.value ? 'border-[#c8102e]' : 'border-[#d3d3d3]'} bg-[#f2eff0]`}>
					<p class='mb-2.5 text-xs text-[#6b6b6b]'>
						Для отправки формы необходимо подтвердить согласие с условиями обработки персональных данных и правилами
						использования сайта.
					</p>
					<label class='mb-2 block text-xs text-[#555]'>
						<input
							type='checkbox'
							checked={privacyChecked.value}
							class='mr-2 mt-[2px] border border-[#7a7a7a]'
							onChange={e => {
								privacyChecked.value = e.currentTarget.checked
							}}
						/>
						Я подтверждаю согласие на обработку персональных данных в соответствии с{' '}
						<a href='/privacy' target='_blank' class='underline hover:no-underline'>
							Политикой конфиденциальности
						</a>
					</label>
					<label class='block text-xs text-[#555]'>
						<input
							type='checkbox'
							checked={termsChecked.value}
							class='mr-2 mt-[2px] border border-[#7a7a7a]'
							onChange={e => {
								termsChecked.value = e.currentTarget.checked
							}}
						/>
						Я принимаю условия{' '}
						<a href='/agreement' target='_blank' class='underline hover:no-underline'>
							Пользовательского соглашения
						</a>
					</label>
					{consentErrors.value ? <p class='mt-3 text-xs text-[#c8102e]'>Подтвердите согласие с Политикой конфиденциальности и Пользовательским соглашением.</p> : null}
				</div>

				<button
					disabled={fetching.value || !privacyChecked.value || !termsChecked.value}
					aria-role='Отправить запрос'
					onClick={() => void handleSubmit()}
					class='w-full mt-4 py-1 px-2 border rounded-md border-neutral-400 disabled:border-neutral-200 hover:enabled:border-neutral-700 hover:enabled:shadow-md group transition-colors'
				>
					<span class='text-xs text-neutral-700 group-disabled:text-neutral-200 group-hover:group-enabled:text-neutral-900 transition-colors'>
						{fetching.value ? 'Отправляю запрос...' : 'Отправить запрос'}
					</span>
				</button>
				<div class='text-red-500 text-sm mt-1'>{sendEmailError.value}</div>
			</div>
		</div>
	)
}

export default OrderForm
