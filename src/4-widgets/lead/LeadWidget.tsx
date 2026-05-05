import { useMemo, useRef, useState } from 'preact/hooks'
import { deleteRuPhoneInputDigit, formatRuPhoneInput, getRuPhoneSubscriberDigits, normalizeRuPhone } from '@shared/utils/phone'

type LeadWidgetProps = {
	webhook?: string
	successUrl?: string
	store?: string
	primary?: string
	border?: string
	privacyUrl?: string
	termsUrl?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

function LeadWidget({
	webhook = 'https://arufefet.beget.app/webhook/calc-notify',
	successUrl = 'https://homekomfort.ru/thanks',
	store = 'Arbonia-Store.ru',
	primary = '#c1121f',
	border = '#e5e5e5',
	privacyUrl = '/privacy',
	termsUrl = '/agreement',
}: LeadWidgetProps) {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [city, setCity] = useState('')
	const [wishes, setWishes] = useState('')
	const [whatsapp, setWhatsapp] = useState('')
	const [channels, setChannels] = useState<string[]>(['whatsapp', 'telegram'])
	const [privacyConsent, setPrivacyConsent] = useState(false)
	const [termsConsent, setTermsConsent] = useState(false)
	const [showConsentErrors, setShowConsentErrors] = useState(false)
	const [showFieldErrors, setShowFieldErrors] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [fileNote, setFileNote] = useState('')
	const [message, setMessage] = useState('')
	const [messageType, setMessageType] = useState<'ok' | 'err' | null>(null)
	const [loading, setLoading] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)

	const selectedFileName = useMemo(() => (file ? file.name : 'Файл не выбран'), [file])
	const hasConsentError = showConsentErrors && (!privacyConsent || !termsConsent)
	const normalizedPhone = useMemo(() => normalizeRuPhone(whatsapp), [whatsapp])
	const phoneSubscriberDigits = useMemo(() => getRuPhoneSubscriberDigits(whatsapp), [whatsapp])
	const needsPhone = channels.includes('whatsapp') || channels.includes('telegram')
	const needsEmail = channels.includes('email')
	const hasPhone = phoneSubscriberDigits.length === 10
	const hasEmail = email.trim().length > 0
	const emailIsValid = !hasEmail || EMAIL_PATTERN.test(email.trim())
	const errors = {
		channels: channels.length === 0 ? 'Выберите хотя бы один способ связи' : '',
		name: name.trim() ? '' : 'Укажите имя',
		wishes: wishes.trim() ? '' : 'Опишите, что нужно подобрать',
		city: city.trim() ? '' : 'Укажите город',
		phone: needsPhone && !hasPhone ? 'Укажите телефон для связи в WhatsApp или Telegram' : '',
		email: needsEmail && !hasEmail ? 'Укажите электронную почту' : hasEmail && !emailIsValid ? 'Проверьте формат электронной почты' : '',
		contact: !needsPhone && !needsEmail && !hasPhone && !hasEmail ? 'Укажите телефон или электронную почту' : '',
		privacy: privacyConsent ? '' : 'Подтвердите согласие с политикой конфиденциальности',
		terms: termsConsent ? '' : 'Примите пользовательское соглашение',
	}
	const hasFieldErrors = Boolean(errors.channels || errors.name || errors.wishes || errors.city || errors.phone || errors.email || errors.contact)

	const toggleChannel = (channel: string) => {
		setChannels(prev => (prev.includes(channel) ? prev.filter(item => item !== channel) : [...prev, channel]))
	}

	const handleFileChange = (nextFile: File | null) => {
		if (!nextFile) {
			setFile(null)
			setFileNote('')
			return
		}

		if (nextFile.size > MAX_FILE_SIZE) {
			setFile(null)
			setFileNote('Файл слишком большой. Выберите файл до 5 Мб.')
			if (fileInputRef.current) fileInputRef.current.value = ''
			return
		}

		setFile(nextFile)
		setFileNote(`Выбран: ${nextFile.name}`)
	}

	const handlePhoneInput = (input: HTMLInputElement, raw: string) => {
		const formatted = formatRuPhoneInput(raw)
		input.value = formatted
		setWhatsapp(formatted)
	}

	const handlePhoneDelete = (event: KeyboardEvent) => {
		const input = event.currentTarget as HTMLInputElement
		const nextValue = deleteRuPhoneInputDigit(input.value, input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length, event.key)
		if (nextValue === null) return

		event.preventDefault()
		input.value = nextValue
		setWhatsapp(nextValue)
		window.requestAnimationFrame(() => {
			input.setSelectionRange(nextValue.length, nextValue.length)
		})
	}

	const handleSubmit = async () => {
		if (loading) return

		const consent = privacyConsent && termsConsent

		setShowConsentErrors(!consent)
		setShowFieldErrors(true)

		if (hasFieldErrors || !consent) {
			setMessage('Проверьте обязательные поля и согласия.')
			setMessageType('err')
			return
		}

		setLoading(true)
		setMessage('')
		setMessageType(null)

		try {
			const formData = new FormData()
			formData.append('store', store)
			formData.append('name', name.trim())
			formData.append('email', email.trim())
			formData.append('city', city.trim())
			formData.append('whatsapp', hasPhone ? normalizedPhone : whatsapp.trim())
			formData.append('phoneFormatted', whatsapp.trim())
			formData.append('wishes', wishes.trim())
			formData.append('channels', JSON.stringify(channels))
			if (file) {
				formData.append('file', file, file.name)
				formData.append('fileName', file.name)
				formData.append('fileType', file.type || 'application/octet-stream')
				formData.append('fileSize', String(file.size))
				formData.append('fileDataUrl', await readFileAsDataUrl(file))
			}

			const response = await fetch(webhook, { method: 'POST', body: formData })
			const result = await response.json()

			if (result.status === 'OK') {
				setMessage('Успешно! Перенаправляем...')
				setMessageType('ok')
				window.setTimeout(() => {
					window.location.href = successUrl
				}, 600)
				return
			}

			throw new Error('Request failed')
		} catch (_error) {
			setLoading(false)
			setMessage('Не удалось отправить, пожалуйста, попробуйте позже.')
			setMessageType('err')
		}
	}

	return (
		<form
			onSubmit={event => {
				event.preventDefault()
				void handleSubmit()
			}}
			class='relative mx-auto max-w-[860px] overflow-hidden rounded-[6px] border bg-white p-4 shadow-sm sm:p-6'
			style={{ borderColor: border }}
		>
			{loading ? (
				<div class='absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm'>
					<div
						class='h-10 w-10 animate-spin rounded-full border-4 border-[#f3f3f3]'
						style={{ borderTopColor: primary }}
					/>
					<div class='mt-3 text-sm font-medium text-[#333]'>Отправляем данные...</div>
				</div>
			) : null}

			<div class='mb-1 text-base font-semibold text-[#111]'>Как с вами связаться?</div>
			<div class='mb-3 text-sm text-[#666]'>Выберите удобные способы связи:</div>
			<div class='mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#333]'>
				<label class='inline-flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('whatsapp')}
						onChange={() => toggleChannel('whatsapp')}
					/>{' '}
					WhatsApp
				</label>
				<label class='inline-flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('telegram')}
						onChange={() => toggleChannel('telegram')}
					/>{' '}
					Telegram
				</label>
				<label class='inline-flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('email')}
						onChange={() => toggleChannel('email')}
					/>{' '}
					Электронная почта
				</label>
			</div>
			{showFieldErrors && errors.channels ? <div class='-mt-3 mb-4 text-xs text-[#b91c1c]'>{errors.channels}</div> : null}

			<div class='mb-4'>
				<div class='mb-1.5 text-sm font-medium text-[#333]'>
					Ваши пожелания<span class='text-[#b91c1c]'>*</span>
				</div>
				<textarea
					value={wishes}
					onChange={e => setWishes(e.currentTarget.value)}
					placeholder='Модель, размеры, цвет, бюджет, особенности помещения...'
					class='min-h-[120px] w-full rounded-[4px] border border-[#d8d8d8] px-3 py-2 text-sm leading-6 text-[#222] placeholder:text-[#9a9a9a] focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
				/>
				{showFieldErrors && errors.wishes ? <div class='mt-1 text-xs text-[#b91c1c]'>{errors.wishes}</div> : null}
			</div>

			<div class='my-5 h-px bg-[#eeeeee]' />

			<div class='mb-3 text-base font-semibold text-[#111]'>Контактная информация</div>
			<div class='grid gap-4 sm:grid-cols-2'>
				<div>
					<div class='mb-1.5 text-sm font-medium text-[#333]'>
						Имя<span class='text-[#b91c1c]'>*</span>
					</div>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.currentTarget.value)}
						placeholder='Как к вам обращаться'
						class='h-10 w-full rounded-[4px] border border-[#d8d8d8] px-3 text-sm text-[#222] placeholder:text-[#9a9a9a] focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
					/>
					{showFieldErrors && errors.name ? <div class='mt-1 text-xs text-[#b91c1c]'>{errors.name}</div> : null}
				</div>
				<div>
					<div class='mb-1.5 text-sm font-medium text-[#333]'>
						Город<span class='text-[#b91c1c]'>*</span>
					</div>
					<input
						type='text'
						value={city}
						onChange={e => setCity(e.currentTarget.value)}
						placeholder='Город'
						class='h-10 w-full rounded-[4px] border border-[#d8d8d8] px-3 text-sm text-[#222] placeholder:text-[#9a9a9a] focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
					/>
					{showFieldErrors && errors.city ? <div class='mt-1 text-xs text-[#b91c1c]'>{errors.city}</div> : null}
				</div>
				<div>
					<div class='mb-1.5 text-sm font-medium text-[#333]'>
						Телефон{needsPhone ? <span class='text-[#b91c1c]'>*</span> : null}
					</div>
					<input
						type='tel'
						inputMode='tel'
						value={whatsapp}
						onKeyDown={handlePhoneDelete}
						onInput={e => handlePhoneInput(e.currentTarget, e.currentTarget.value)}
						onPaste={event => {
							event.preventDefault()
							const pasted = event.clipboardData.getData('text')
							handlePhoneInput(event.currentTarget, pasted)
						}}
						maxLength={18}
						placeholder='+7 (999) 999-99-99'
						class='h-10 w-full rounded-[4px] border border-[#d8d8d8] px-3 text-sm text-[#222] placeholder:text-[#9a9a9a] focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
					/>
					{showFieldErrors && errors.phone ? <div class='mt-1 text-xs text-[#b91c1c]'>{errors.phone}</div> : null}
				</div>
				<div>
					<div class='mb-1.5 text-sm font-medium text-[#333]'>
						Электронная почта{needsEmail ? <span class='text-[#b91c1c]'>*</span> : null}
					</div>
					<input
						type='email'
						value={email}
						onChange={e => setEmail(e.currentTarget.value)}
						placeholder='Электронная почта'
						class='h-10 w-full rounded-[4px] border border-[#d8d8d8] px-3 text-sm text-[#222] placeholder:text-[#9a9a9a] focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]'
					/>
					{showFieldErrors && errors.email ? <div class='mt-1 text-xs text-[#b91c1c]'>{errors.email}</div> : null}
				</div>
			</div>
			{showFieldErrors && errors.contact ? <div class='mt-2 text-xs text-[#b91c1c]'>{errors.contact}</div> : null}

			<div class='mt-5'>
				<div class='mb-1.5 text-sm font-medium text-[#333]'>Прикрепить фото или смету</div>
				<input
					type='file'
					ref={fileInputRef}
					onChange={e => handleFileChange(e.currentTarget.files?.[0] || null)}
					accept='*/*'
					class='sr-only'
					id='lead-file-input'
				/>
				<div class='flex flex-col gap-2 sm:flex-row sm:items-center'>
					<label
						htmlFor='lead-file-input'
						class='inline-flex h-9 cursor-pointer items-center justify-center rounded-[4px] border border-[#d8d8d8] bg-white px-4 text-sm font-medium text-[#222] transition hover:border-[#b91c1c] hover:text-[#991b1b]'
					>
						Выбрать файл
					</label>
					<div class='text-sm text-[#666]'>{selectedFileName}</div>
					<div class='text-xs text-[#888]'>до 5 Мб</div>
				</div>
				{fileNote ? <div class={`mt-1 text-xs ${file ? 'text-[#0a7a2f]' : 'text-[#b00020]'}`}>{fileNote}</div> : null}
			</div>

			<div
				class={`mt-5 rounded-[4px] border p-3 ${
					hasConsentError ? 'border-[#c8102e]' : 'border-[#d3d3d3]'
				} bg-[#fafafa]`}
			>
				<div class='mb-2 text-xs leading-5 text-[#666]'>
					Для отправки формы необходимо подтвердить согласие с условиями обработки персональных данных и правилами
					использования сайта.
				</div>
				<label class='mb-2 flex items-start gap-2 text-xs leading-5 text-[#444]'>
					<input
						type='checkbox'
						checked={privacyConsent}
						onChange={e => {
							setPrivacyConsent(e.currentTarget.checked)
							if (e.currentTarget.checked && termsConsent) setShowConsentErrors(false)
						}}
						class='mt-0.5'
					/>
					<span>
						Я подтверждаю согласие на обработку персональных данных в соответствии с{' '}
						<a href={privacyUrl} target='_blank' rel='noopener noreferrer' class='text-[#b91c1c] underline decoration-[#b91c1c]/40 underline-offset-[3px] hover:no-underline'>
							Политикой конфиденциальности
						</a>
					</span>
				</label>
				<label class='flex items-start gap-2 text-xs leading-5 text-[#444]'>
					<input
						type='checkbox'
						checked={termsConsent}
						onChange={e => {
							setTermsConsent(e.currentTarget.checked)
							if (e.currentTarget.checked && privacyConsent) setShowConsentErrors(false)
						}}
						class='mt-0.5'
					/>
					<span>
						Я принимаю условия{' '}
						<a href={termsUrl} target='_blank' rel='noopener noreferrer' class='text-[#b91c1c] underline decoration-[#b91c1c]/40 underline-offset-[3px] hover:no-underline'>
							Пользовательского соглашения
						</a>
					</span>
				</label>
				{hasConsentError ? (
					<div class='mt-2.5 text-xs text-[#c8102e]'>
						Подтвердите согласие с Политикой конфиденциальности и Пользовательским соглашением.
					</div>
				) : null}
			</div>

			<div class='mt-5 flex justify-start'>
				<button
					type='submit'
					disabled={loading}
					class='inline-flex h-11 w-full items-center justify-center rounded-[4px] px-5 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:cursor-default disabled:opacity-80 sm:w-auto sm:min-w-[320px]'
					style={{ background: primary }}
				>
					Получить расчёт стоимости
				</button>
			</div>

			{message ? (
				<div
					class={`mt-2.5 text-center text-sm font-medium ${messageType === 'ok' ? 'text-[#0a7a2f]' : 'text-[#b00020]'}`}
				>
					{message}
				</div>
			) : null}
		</form>
	)
}

export default LeadWidget
