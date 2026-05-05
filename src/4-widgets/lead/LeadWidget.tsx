import { useMemo, useRef, useState } from 'preact/hooks'

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
const REQUIRED_FIELDS: Array<'name' | 'email' | 'wishes'> = ['name', 'email', 'wishes']

function LeadWidget({
	webhook = 'https://arufefet.beget.app/webhook/calc-notify',
	successUrl = 'https://homekomfort.ru/thanks',
	store = 'Arbonia-Store.ru',
	primary = '#018ed2',
	border = '#1e1e1e',
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
	const [file, setFile] = useState<File | null>(null)
	const [fileNote, setFileNote] = useState('')
	const [message, setMessage] = useState('')
	const [messageType, setMessageType] = useState<'ok' | 'err' | null>(null)
	const [loading, setLoading] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)

	const selectedFileName = useMemo(() => (file ? file.name : 'Файл не выбран'), [file])
	const hasConsentError = showConsentErrors && (!privacyConsent || !termsConsent)

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
			setFileNote('Файл слишком большой! Выберите файл до 5Мб.')
			if (fileInputRef.current) fileInputRef.current.value = ''
			return
		}

		setFile(nextFile)
		setFileNote(`Выбран: ${nextFile.name}`)
	}

	const handleSubmit = async () => {
		if (loading) return

		const fields = {
			name: name.trim(),
			email: email.trim(),
			wishes: wishes.trim(),
		}
		const consent = privacyConsent && termsConsent
		const isMissingRequired = REQUIRED_FIELDS.some(key => !fields[key])

		setShowConsentErrors(!consent)

		if (isMissingRequired || channels.length === 0 || !consent) {
			setMessage('Пожалуйста, заполните все поля, выберите способ связи и подтвердите оба согласия.')
			setMessageType('err')
			return
		}

		setLoading(true)
		setMessage('')
		setMessageType(null)

		try {
			const formData = new FormData()
			formData.append('store', store)
			formData.append('name', fields.name)
			formData.append('email', fields.email)
			formData.append('city', city.trim())
			formData.append('whatsapp', whatsapp.trim())
			formData.append('wishes', fields.wishes)
			formData.append('channels', JSON.stringify(channels))
			if (file) formData.append('file', file)

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
			class='relative mx-auto max-w-[980px] overflow-hidden rounded-[18px] bg-white p-3 sm:p-5'
			style={{ border: `3px solid ${border}` }}
		>
			{loading ? (
				<div class='absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm'>
					<div
						class='h-12 w-12 animate-spin rounded-full border-[5px] border-[#f3f3f3]'
						style={{ borderTopColor: primary }}
					/>
					<div class='mt-3 text-sm font-medium text-[#333]'>Отправляем данные...</div>
				</div>
			) : null}

			<div class='mb-1.5 font-semibold text-[#111]'>Как нам с Вами связаться?</div>
			<div class='mb-2.5 text-xs text-[#6b6b6b]'>Выберите наиболее удобный для Вас канал, чтобы получить расчёт:</div>
			<div class='mb-4 flex flex-col gap-2 text-sm text-[#555]'>
				<label class='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('whatsapp')}
						onChange={() => toggleChannel('whatsapp')}
					/>{' '}
					WhatsApp
				</label>
				<label class='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('telegram')}
						onChange={() => toggleChannel('telegram')}
					/>{' '}
					Telegram
				</label>
				<label class='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={channels.includes('email')}
						onChange={() => toggleChannel('email')}
					/>{' '}
					Электронная почта
				</label>
			</div>

			<div class='mb-1.5 font-semibold text-[#111]'>Ваши пожелания</div>
			<div class='mb-3'>
				<div class='mb-1.5 text-xs text-[#555]'>
					Ваши требования и пожелания в свободной форме:<span class='text-[#b00020]'>*</span>
				</div>
				<textarea
					value={wishes}
					onChange={e => setWishes(e.currentTarget.value)}
					placeholder='Модель, цвет, размеры, бюджет...'
					class='min-h-[90px] w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2.5'
				/>
			</div>

			<div class='my-3 h-px bg-[#f0f0f0]' />

			<div class='mb-1.5 font-semibold text-[#111]'>Контактная информация</div>
			<div class='mb-2.5'>
				<div class='mb-1.5 text-xs text-[#555]'>
					Как к вам можно обращаться<span class='text-[#b00020]'>*</span>
				</div>
				<input
					type='text'
					value={name}
					onChange={e => setName(e.currentTarget.value)}
					placeholder='Имя'
					class='w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2.5'
				/>
			</div>

			<div class='mb-2.5 grid gap-3 sm:grid-cols-2'>
				<div>
					<div class='mb-1.5 text-xs text-[#555]'>Телефон</div>
					<input
						type='text'
						value={whatsapp}
						onChange={e => setWhatsapp(e.currentTarget.value)}
						placeholder='+7 (999) 123-45-67'
						class='w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2.5'
					/>
				</div>
				<div>
					<div class='mb-1.5 text-xs text-[#555]'>
						Ваша электронная почта<span class='text-[#b00020]'>*</span>
					</div>
					<input
						type='email'
						value={email}
						onChange={e => setEmail(e.currentTarget.value)}
						placeholder='Электронная почта'
						class='w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2.5'
					/>
				</div>
			</div>

			<div class='mb-3'>
				<div class='mb-1.5 text-xs text-[#555]'>
					Город. Для расчёта доставки<span class='text-[#b00020]'>*</span>
				</div>
				<input
					type='text'
					value={city}
					onChange={e => setCity(e.currentTarget.value)}
					placeholder='Город'
					class='w-full rounded-[10px] border border-[#e0e0e0] px-3 py-2.5'
				/>
			</div>

			<div class='mb-3'>
				<div class='mb-1.5 text-xs text-[#555]'>Прикрепите фото или смету (до 5Мб)</div>
				<input
					type='file'
					ref={fileInputRef}
					onChange={e => handleFileChange(e.currentTarget.files?.[0] || null)}
					accept='*/*'
					class='block text-xs'
				/>
				<div class='mt-1 text-xs text-[#666]'>{selectedFileName}</div>
				{fileNote ? <div class={`mt-1 text-xs ${file ? 'text-[#0a7a2f]' : 'text-[#b00020]'}`}>{fileNote}</div> : null}
			</div>

			<div
				class={`mt-2 rounded-[18px] border p-4 ${
					hasConsentError ? 'border-[#c8102e]' : 'border-[#d3d3d3]'
				} bg-[#f2eff0]`}
			>
				<div class='mb-2.5 text-xs text-[#6b6b6b]'>
					Для отправки формы необходимо подтвердить согласие с условиями обработки персональных данных и правилами
					использования сайта.
				</div>
				<label class='mb-2 block text-xs text-[#555]'>
					<input
						type='checkbox'
						checked={privacyConsent}
						onChange={e => {
							setPrivacyConsent(e.currentTarget.checked)
							if (e.currentTarget.checked && termsConsent) setShowConsentErrors(false)
						}}
						class='mr-2'
					/>
					Я подтверждаю согласие на обработку персональных данных в соответствии с{' '}
					<a
						href={privacyUrl}
						target='_blank'
						rel='noopener noreferrer'
						class='underline hover:no-underline'
						style={{ color: primary }}
					>
						Политикой конфиденциальности
					</a>
				</label>
				<label class='block text-xs text-[#555]'>
					<input
						type='checkbox'
						checked={termsConsent}
						onChange={e => {
							setTermsConsent(e.currentTarget.checked)
							if (e.currentTarget.checked && privacyConsent) setShowConsentErrors(false)
						}}
						class='mr-2'
					/>
					Я принимаю условия{' '}
					<a
						href={termsUrl}
						target='_blank'
						rel='noopener noreferrer'
						class='underline hover:no-underline'
						style={{ color: primary }}
					>
						Пользовательского соглашения
					</a>
				</label>
				{hasConsentError ? (
					<div class='mt-2.5 text-xs text-[#c8102e]'>
						Подтвердите согласие с Политикой конфиденциальности и Пользовательским соглашением.
					</div>
				) : null}
			</div>

			<div class='mt-4 flex justify-center'>
				<button
					type='submit'
					disabled={loading}
					class='inline-flex min-w-[min(360px,100%)] items-center justify-center rounded-[10px] px-4 py-2.5 font-semibold text-white transition hover:brightness-105 disabled:cursor-default disabled:opacity-90'
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
