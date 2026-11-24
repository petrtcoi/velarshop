import { useEffect, useRef, useState } from 'preact/hooks'

import { reachMetrikaGoal } from '@shared/utils/metrika'

type Props = {
	slug: string
	title: string
	/** Canonical article path, e.g. /info/<slug>. Query params are never shared. */
	path: string
	compact?: boolean
}

const linkClass = 'text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900'

function getCanonicalUrl(path: string): string {
	try {
		const url = new URL(path, window.location.origin)
		url.search = ''
		url.hash = ''
		return url.toString()
	} catch {
		return path
	}
}

function SaveArticle({ slug, title, path, compact = false }: Props) {
	const [open, setOpen] = useState(false)
	const [copied, setCopied] = useState(false)
	const timer = useRef<number | undefined>(undefined)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const url = typeof window === 'undefined' ? path : getCanonicalUrl(path)
	const sizeClass = compact ? 'text-xs' : 'text-sm'

	const track = (method: string) => reachMetrikaGoal('article_save', { slug, method })

	const save = async () => {
		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share({ title, url })
				track('native')
				return
			} catch (error) {
				if ((error as { name?: string } | null)?.name === 'AbortError') return
			}
		}
		setOpen(true)
	}

	const showCopied = () => {
		setCopied(true)
		window.clearTimeout(timer.current)
		timer.current = window.setTimeout(() => setCopied(false), 2000)
	}

	const copy = async () => {
		if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(url)
				track('copy')
				showCopied()
				return
			} catch {
				// Fall through to the readonly input.
			}
		}
		const input = inputRef.current
		if (input) {
			input.focus()
			input.select()
			try {
				if (document.execCommand('copy')) {
					track('copy')
					showCopied()
				}
			} catch {
				// The URL stays selected for manual copying.
			}
		}
	}

	const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
	const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`

	return (
		<div class={`flex min-w-0 flex-col items-start gap-2 font-normal ${sizeClass}`}>
			<button
				type='button'
				onClick={save}
				aria-expanded={open}
				class={`inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 font-normal text-neutral-900 transition hover:border-neutral-900 ${sizeClass}`}
			>
				<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
					<path d='M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z' />
				</svg>
				Сохранить статью
			</button>
			{open && (
				<div class='flex min-w-0 max-w-full flex-col gap-2'>
					<div class='flex flex-wrap gap-x-4 gap-y-1'>
						<a href={telegramHref} target='_blank' rel='noopener noreferrer' onClick={() => track('telegram')} class={linkClass}>
							Telegram
						</a>
						<a href={whatsappHref} target='_blank' rel='noopener noreferrer' onClick={() => track('whatsapp')} class={linkClass}>
							WhatsApp
						</a>
						<button type='button' onClick={copy} class={`cursor-pointer border-0 bg-transparent p-0 font-normal ${linkClass}`}>
							{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
						</button>
					</div>
					<input
						ref={inputRef}
						type='text'
						readOnly
						value={url}
						aria-label='Ссылка на статью'
						onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
						class='sr-only'
						tabIndex={-1}
					/>
				</div>
			)}
		</div>
	)
}

export default SaveArticle
