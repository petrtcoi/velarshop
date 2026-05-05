import sendOrderConfirmation from '@features/order/SendEmailOrderConfirmation/sendEmailOrderConfirmation'
import { storeShoppingCart } from '@features/order/ShoppingCart'
import { useStore } from '@nanostores/preact'
import { computed, signal } from '@preact/signals'
import { deleteRuPhoneInputDigit, formatRuPhoneInput, getRuPhoneSubscriberDigits, normalizeRuPhone } from '@shared/utils/phone'

const FORM_ID = 'order-form'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Errors = {
	name?: string
	city?: string
	phone?: string
	email?: string
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

const normalizedPhone = computed(() => normalizeRuPhone(phone.value))
const phoneDigits = computed(() => getRuPhoneSubscriberDigits(phone.value))
const hasPhone = computed(() => phoneDigits.value.length === 10)
const hasEmail = computed(() => email.value.trim().length > 0)
const emailIsValid = computed(() => !hasEmail.value || EMAIL_PATTERN.test(email.value.trim()))

const errors = computed(() => {
	if (!checkForm.value) return {}

	let errs: Errors = {}
	if (!name.value.trim()) errs.name = 'Укажите имя'
	if (!city.value.trim()) errs.city = 'Укажите город доставки'
	if (phone.value.trim() && !hasPhone.value) errs.phone = 'Введите телефон полностью'
	if (hasEmail.value && !emailIsValid.value) errs.email = 'Проверьте формат электронной почты'
	if (!hasPhone.value && !hasEmail.value) errs.contacts = 'Укажите телефон или электронную почту'
	return errs
})
const isErrors = computed(() => !!Object.keys(errors.value).length)
const consentErrors = computed(() => checkForm.value && (!privacyChecked.value || !termsChecked.value))

function handlePhoneInput(input: HTMLInputElement, raw: string) {
	const formatted = formatRuPhoneInput(raw)
	input.value = formatted
	phone.value = formatted
}

function handlePhoneDelete(event: KeyboardEvent) {
	const input = event.currentTarget as HTMLInputElement
	const nextValue = deleteRuPhoneInputDigit(input.value, input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length, event.key)
	if (nextValue === null) return

	event.preventDefault()
	input.value = nextValue
	phone.value = nextValue
	window.requestAnimationFrame(() => {
		input.setSelectionRange(nextValue.length, nextValue.length)
	})
}

function OrderForm() {
	const shoppingCart = useStore(storeShoppingCart)
	if (shoppingCart.items.length === 0) return null

	const handleSubmit = async () => {
		if (!window?.location || fetching.value) return
		sendEmailError.value = ''
		checkForm.value = true

		if (isErrors.value || !privacyChecked.value || !termsChecked.value) {
			window.location.href = `#${FORM_ID}`
			return
		}

		fetching.value = true
		const result = await sendOrderConfirmation({
			formData: {
				name: name.value.trim(),
				city: city.value.trim(),
				phone: hasPhone.value ? normalizedPhone.value : phone.value.trim(),
				email: email.value.trim(),
				comments: comments.value.trim(),
			},
		})
		fetching.value = false
		if (result === 'ok') {
			storeShoppingCart.set({ items: [] })
			window.location.href = '/success'
			return
		}
		sendEmailError.value = 'Во время отправки заявки произошла ошибка. Попробуйте еще раз.'
	}

	return (
		<form
			id={FORM_ID}
			onSubmit={event => {
				event.preventDefault()
				void handleSubmit()
			}}
			class='min-w-0 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-6'
		>
			<h2 class='m-0 text-xl font-semibold tracking-tight text-neutral-950'>Информация</h2>
			<p class='mt-2 text-sm leading-6 text-neutral-600'>
				Оставьте данные, чтобы менеджер мог уточнить параметры и отправить расчет.
			</p>

			<div class='mt-5 grid gap-4'>
				<label class='block'>
					<span class='mb-1.5 block text-sm font-medium text-neutral-800'>
						Имя<span class='text-[#b91c1c]'>*</span>
					</span>
					<input
						value={name.value}
						onInput={e => (name.value = e.currentTarget.value)}
						aria-required='true'
						aria-invalid={errors.value.name ? 'true' : 'false'}
						name='name'
						type='text'
						placeholder='Как к вам обращаться'
						class='h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c] aria-invalid:border-[#b91c1c]'
					/>
					{errors.value.name && <p class='mt-1 text-xs text-[#b91c1c]'>{errors.value.name}</p>}
				</label>

				<label class='block'>
					<span class='mb-1.5 block text-sm font-medium text-neutral-800'>
						Город<span class='text-[#b91c1c]'>*</span>
					</span>
					<input
						value={city.value}
						onInput={e => (city.value = e.currentTarget.value)}
						aria-required='true'
						aria-invalid={errors.value.city ? 'true' : 'false'}
						name='city'
						type='text'
						placeholder='Город доставки'
						class='h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c] aria-invalid:border-[#b91c1c]'
					/>
					{errors.value.city && <p class='mt-1 text-xs text-[#b91c1c]'>{errors.value.city}</p>}
				</label>

				<label class='block'>
					<span class='mb-1.5 block text-sm font-medium text-neutral-800'>Телефон</span>
					<input
						value={phone.value}
						onKeyDown={handlePhoneDelete}
						onInput={e => handlePhoneInput(e.currentTarget, e.currentTarget.value)}
						onPaste={event => {
							event.preventDefault()
							handlePhoneInput(event.currentTarget, event.clipboardData.getData('text'))
						}}
						aria-invalid={errors.value.phone || errors.value.contacts ? 'true' : 'false'}
						name='phone'
						type='tel'
						inputMode='tel'
						maxLength={18}
						placeholder='+7 (999) 999-99-99'
						class='h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c] aria-invalid:border-[#b91c1c]'
					/>
					{errors.value.phone && <p class='mt-1 text-xs text-[#b91c1c]'>{errors.value.phone}</p>}
				</label>

				<label class='block'>
					<span class='mb-1.5 block text-sm font-medium text-neutral-800'>Электронная почта</span>
					<input
						value={email.value}
						onInput={e => (email.value = e.currentTarget.value)}
						aria-invalid={errors.value.email || errors.value.contacts ? 'true' : 'false'}
						name='email'
						type='email'
						placeholder='mail@example.ru'
						class='h-10 w-full rounded-md border border-neutral-300 px-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c] aria-invalid:border-[#b91c1c]'
					/>
					{errors.value.email && <p class='mt-1 text-xs text-[#b91c1c]'>{errors.value.email}</p>}
				</label>

				{errors.value.contacts && <p class='-mt-2 text-xs text-[#b91c1c]'>{errors.value.contacts}</p>}

				<label class='block'>
					<span class='mb-1.5 block text-sm font-medium text-neutral-800'>Комментарий</span>
					<textarea
						value={comments.value}
						onInput={e => (comments.value = e.currentTarget.value)}
						name='comments'
						rows={4}
						placeholder='Цвет, подключение, сроки, особенности объекта...'
						class='w-full rounded-md border border-neutral-300 px-3 py-2 text-sm leading-6 text-neutral-950 placeholder:text-neutral-400 focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
					/>
				</label>
			</div>

			<div class={`mt-5 rounded-md border p-3 ${consentErrors.value ? 'border-[#b91c1c]' : 'border-neutral-200'} bg-neutral-50`}>
				<p class='mb-2 text-xs leading-5 text-neutral-600'>
					Для отправки формы подтвердите согласие с условиями обработки персональных данных и правилами использования сайта.
				</p>
				<label class='mb-2 flex items-start gap-2 text-xs leading-5 text-neutral-700'>
					<input
						type='checkbox'
						checked={privacyChecked.value}
						class='mt-0.5'
						onChange={e => {
							privacyChecked.value = e.currentTarget.checked
						}}
					/>
					<span>
						Я подтверждаю согласие на обработку персональных данных в соответствии с{' '}
						<a href='/privacy' target='_blank' rel='noopener noreferrer' class='text-[#b91c1c] underline decoration-[#b91c1c]/40 underline-offset-[3px] hover:no-underline'>
							Политикой конфиденциальности
						</a>
					</span>
				</label>
				<label class='flex items-start gap-2 text-xs leading-5 text-neutral-700'>
					<input
						type='checkbox'
						checked={termsChecked.value}
						class='mt-0.5'
						onChange={e => {
							termsChecked.value = e.currentTarget.checked
						}}
					/>
					<span>
						Я принимаю условия{' '}
						<a href='/agreement' target='_blank' rel='noopener noreferrer' class='text-[#b91c1c] underline decoration-[#b91c1c]/40 underline-offset-[3px] hover:no-underline'>
							Пользовательского соглашения
						</a>
					</span>
				</label>
				{consentErrors.value ? <p class='mt-2 text-xs text-[#b91c1c]'>Подтвердите оба согласия.</p> : null}
			</div>

			<button
				disabled={fetching.value || !privacyChecked.value || !termsChecked.value}
				aria-label='Отправить заявку на расчет'
				type='submit'
				class='mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#c1121f] px-5 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:cursor-default disabled:bg-neutral-300 disabled:text-neutral-500'
			>
				{fetching.value ? 'Отправляем заявку...' : 'Получить расчет стоимости'}
			</button>
			{sendEmailError.value ? <div class='mt-2 text-sm text-[#b91c1c]'>{sendEmailError.value}</div> : null}
		</form>
	)
}

export default OrderForm
