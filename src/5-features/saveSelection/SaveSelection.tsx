import { useEffect, useRef, useState } from 'preact/hooks'

import { contacts } from '@shared/constants/contacts'
import { reachMetrikaGoal } from '@shared/utils/metrika'

type Props = {
	/** Page path (or absolute URL) that opens with this selection preselected. */
	path: string
	/** One line with the selection: model, size, connection, color, price. */
	text: string
	/** Model code, sent to Metrika. */
	model: string
	/** Smaller text (table rows, cards, configurator). */
	compact?: boolean
	/** Table rows: show the manager line only after the panel is opened. */
	managerLine?: 'always' | 'opened'
	align?: 'start' | 'end'
}

const linkClass = 'text-red-700 underline decoration-red-300 underline-offset-4 transition hover:decoration-transparent'

function getAbsoluteUrl(path: string): string {
	try {
		return new URL(path, window.location.origin).toString()
	} catch {
		return path
	}
}

function SaveSelection({ path, text, model, compact = false, managerLine = 'always', align = 'start' }: Props) {
	const [open, setOpen] = useState(false)
	const [copied, setCopied] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const url = typeof window === 'undefined' ? path : getAbsoluteUrl(path)
	const sizeClass = compact ? 'text-xs' : 'text-sm'
	const alignClass = align === 'end' ? 'items-end text-right' : 'items-start text-left'

	const track = (goal: string, method?: string) => {
		const params: Record<string, string> = { source_path: window.location.pathname, model }
		if (method) params.method = method
		reachMetrikaGoal(goal, params)
	}

	const save = async () => {
		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share({ title: 'Подбор радиатора Velar', text, url })
				track('calc_save', 'native')
				return
			} catch (error) {
				if ((error as { name?: string } | null)?.name === 'AbortError') return
			}
		}
		setOpen(true)
	}

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url)
			track('calc_save', 'copy')
			setCopied(true)
			window.clearTimeout(timer.current)
			timer.current = window.setTimeout(() => setCopied(false), 2000)
		} catch {
			// Clipboard may be blocked; the other options stay available.
		}
	}

	const managerText = `Здравствуйте! Хочу уточнить подбор: ${text} ${url}`
	const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
	const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
	const managerWhatsappHref = `https://wa.me/${contacts.whatsApp}?text=${encodeURIComponent(managerText)}`
	const managerEmailHref = `mailto:${contacts.email}?subject=${encodeURIComponent('Подбор радиатора')}&body=${encodeURIComponent(managerText)}`

	const showManagerLine = managerLine === 'always' || open

	return (
		<div class={`flex min-w-0 flex-col gap-1 font-normal ${sizeClass} ${alignClass}`}>
			<button
				type='button'
				onClick={save}
				aria-expanded={open}
				class={`cursor-pointer border-0 bg-transparent p-0 font-normal ${alignClass.includes('text-right') ? 'text-right' : 'text-left'} ${linkClass}`}
			>
				Сохранить подбор
			</button>
			{open && (
				<div class={`flex flex-wrap gap-x-3 gap-y-1 ${align === 'end' ? 'justify-end' : ''}`}>
					<a
						href={telegramHref}
						target='_blank'
						rel='noopener noreferrer'
						onClick={() => track('calc_save', 'telegram')}
						class={linkClass}
					>
						Telegram
					</a>
					<a
						href={whatsappShareHref}
						target='_blank'
						rel='noopener noreferrer'
						onClick={() => track('calc_save', 'whatsapp')}
						class={linkClass}
					>
						WhatsApp
					</a>
					<button
						type='button'
						onClick={copy}
						class={`cursor-pointer border-0 bg-transparent p-0 font-normal ${linkClass}`}
					>
						{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
					</button>
				</div>
			)}
			{showManagerLine && (
				<p class='m-0 text-neutral-600'>
					Отправить подбор менеджеру:{' '}
					<a
						href={managerWhatsappHref}
						target='_blank'
						rel='noopener noreferrer'
						onClick={() => track('calc_send_whatsapp')}
						class={linkClass}
					>
						WhatsApp
					</a>
					{' · '}
					<a
						href={managerEmailHref}
						onClick={() => track('calc_send_email')}
						class={linkClass}
					>
						почта
					</a>
				</p>
			)}
		</div>
	)
}

export default SaveSelection
