import { useStore } from '@nanostores/preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { storeCartTotalQnty } from '@features/order/ShoppingCart'
import { contacts } from '@shared/constants/contacts'
import { reachMetrikaGoal } from '@shared/utils/metrika'

// Bottom bar for phones (<= 900 px, the same breakpoint as the mobile header).
// Styles: .mobile-bottom-nav* and .bottom-contact* in src/7-shared/styles/global.css.

type Props = {
	currentPath?: string
}

// Listened by the phone instance of HeaderQuickSearch in Header.astro
const QUICK_SEARCH_OPEN_EVENT = 'velar:open-quick-search'

const NON_TEXT_INPUT_TYPES = ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image', 'hidden']

function isTextField(element: EventTarget | null): boolean {
	if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true
	if (element instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.includes(element.type)
	return element instanceof HTMLElement && element.isContentEditable
}

const iconProps = {
	xmlns: 'http://www.w3.org/2000/svg',
	width: '22',
	height: '22',
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: '1.5',
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
	'aria-hidden': 'true' as const,
}

export default function MobileBottomNav({ currentPath = '/' }: Props) {
	const cartTotalQnty = useStore(storeCartTotalQnty)
	const [keyboardOpen, setKeyboardOpen] = useState(false)
	const [contactOpen, setContactOpen] = useState(false)
	const contactButtonRef = useRef<HTMLButtonElement>(null)
	const firstContactLinkRef = useRef<HTMLAnchorElement>(null)

	const hasItems = cartTotalQnty > 0
	const badgeText = cartTotalQnty > 99 ? '99+' : String(cartTotalQnty)
	const isRequestPage = currentPath.replace(/\/+$/, '') === '/cart'

	const closeContact = () => {
		setContactOpen(false)
		contactButtonRef.current?.focus({ preventScroll: true })
	}

	// Hide the bar while a text field is focused (virtual keyboard on phones)
	useEffect(() => {
		let blurTimer = 0

		const handleFocusIn = (event: FocusEvent) => {
			if (isTextField(event.target)) {
				window.clearTimeout(blurTimer)
				setKeyboardOpen(true)
			}
		}
		const handleFocusOut = () => {
			window.clearTimeout(blurTimer)
			blurTimer = window.setTimeout(() => setKeyboardOpen(isTextField(document.activeElement)), 100)
		}

		document.addEventListener('focusin', handleFocusIn)
		document.addEventListener('focusout', handleFocusOut)
		return () => {
			window.clearTimeout(blurTimer)
			document.removeEventListener('focusin', handleFocusIn)
			document.removeEventListener('focusout', handleFocusOut)
		}
	}, [])

	useEffect(() => {
		if (!contactOpen) return

		document.documentElement.classList.add('bottom-contact-open')
		firstContactLinkRef.current?.focus({ preventScroll: true })

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeContact()
		}

		window.addEventListener('keydown', handleEscape)
		return () => {
			window.removeEventListener('keydown', handleEscape)
			document.documentElement.classList.remove('bottom-contact-open')
		}
	}, [contactOpen])

	const openCatalog = () => {
		reachMetrikaGoal('bottom_nav_catalog')
		// Same <details> sheet the header burger opens; its toggle handler in Header.astro locks the page
		const menu = document.querySelector('.mobile-menu')
		if (!(menu instanceof HTMLDetailsElement)) {
			window.location.href = '/#catalog'
			return
		}
		if (!menu.open) menu.open = true
		const closeButton = menu.querySelector('.mobile-sheet-close')
		if (closeButton instanceof HTMLElement) closeButton.focus({ preventScroll: true })
	}

	const openSelection = () => {
		reachMetrikaGoal('bottom_nav_selection')
		window.dispatchEvent(new CustomEvent(QUICK_SEARCH_OPEN_EVENT))
	}

	const openContact = () => {
		reachMetrikaGoal('bottom_nav_contact')
		setContactOpen(true)
	}

	// phone_click / messenger_click are fired by the global tel: / wa.me / t.me click listener in Layout.astro,
	// so the contact links below do not call reachMetrikaGoal themselves (no double counting).
	return (
		<>
			<nav
				class={`mobile-bottom-nav${keyboardOpen ? ' is-hidden' : ''}`}
				aria-label='Нижнее меню'
			>
				<ul class='mobile-bottom-nav__list'>
					<li>
						<button
							type='button'
							class='mobile-bottom-nav__item'
							aria-haspopup='dialog'
							onClick={openCatalog}
						>
							<svg {...iconProps}>
								<rect x='3' y='3' width='7' height='7' rx='1' />
								<rect x='14' y='3' width='7' height='7' rx='1' />
								<rect x='3' y='14' width='7' height='7' rx='1' />
								<rect x='14' y='14' width='7' height='7' rx='1' />
							</svg>
							<span class='mobile-bottom-nav__label'>Каталог</span>
						</button>
					</li>
					<li>
						<button
							type='button'
							class='mobile-bottom-nav__item'
							aria-haspopup='dialog'
							onClick={openSelection}
						>
							<svg {...iconProps}>
								<path d='M21 4h-7' />
								<path d='M10 4H3' />
								<path d='M21 12h-9' />
								<path d='M8 12H3' />
								<path d='M21 20h-5' />
								<path d='M12 20H3' />
								<path d='M14 2v4' />
								<path d='M8 10v4' />
								<path d='M16 18v4' />
							</svg>
							<span class='mobile-bottom-nav__label'>Подбор</span>
						</button>
					</li>
					<li>
						<a
							href='/cart'
							rel='nofollow'
							class={`mobile-bottom-nav__item${isRequestPage ? ' is-active' : ''}`}
							aria-current={isRequestPage ? 'page' : undefined}
							onClick={() => reachMetrikaGoal('bottom_nav_request')}
						>
							<span class='mobile-bottom-nav__icon'>
								<svg {...iconProps}>
									<rect x='8' y='2' width='8' height='4' rx='1' />
									<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
									<path d='M12 11h4' />
									<path d='M12 16h4' />
									<path d='M8 11h.01' />
									<path d='M8 16h.01' />
								</svg>
								{hasItems && (
									<span
										class='mobile-bottom-nav__badge'
										aria-hidden='true'
									>
										{badgeText}
									</span>
								)}
							</span>
							<span class='mobile-bottom-nav__label'>Запрос</span>
							{hasItems && <span class='sr-only'>, {cartTotalQnty}</span>}
						</a>
					</li>
					<li>
						<button
							type='button'
							class='mobile-bottom-nav__item'
							aria-haspopup='dialog'
							aria-expanded={contactOpen}
							onClick={openContact}
							ref={contactButtonRef}
						>
							<svg {...iconProps}>
								<path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
							</svg>
							<span class='mobile-bottom-nav__label'>Написать</span>
						</button>
					</li>
				</ul>
			</nav>

			{contactOpen && (
				<div class='bottom-contact'>
					<button
						type='button'
						class='bottom-contact__backdrop'
						aria-label='Закрыть'
						tabIndex={-1}
						onClick={closeContact}
					></button>
					<div
						class='bottom-contact__panel'
						role='dialog'
						aria-modal='true'
						aria-labelledby='bottom-contact-title'
					>
						<div class='bottom-contact__header'>
							<div
								id='bottom-contact-title'
								class='bottom-contact__title'
							>
								Связаться с нами
							</div>
							<button
								type='button'
								class='bottom-contact__close'
								aria-label='Закрыть'
								onClick={closeContact}
							>
								✕
							</button>
						</div>
						<a
							href={`https://wa.me/${contacts.whatsApp}`}
							target='_blank'
							rel='noopener noreferrer nofollow'
							class='bottom-contact__link'
							ref={firstContactLinkRef}
							onClick={() => setContactOpen(false)}
						>
							<span class='bottom-contact__icon'>
								<svg {...iconProps}>
									<path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />
								</svg>
							</span>
							<span class='bottom-contact__text'>WhatsApp</span>
						</a>
						<a
							href={contacts.telegram}
							target='_blank'
							rel='noopener noreferrer nofollow'
							class='bottom-contact__link'
							onClick={() => setContactOpen(false)}
						>
							<span class='bottom-contact__icon'>
								<svg {...iconProps}>
									<path d='M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.112z' />
									<path d='m21.854 2.147-10.94 10.939' />
								</svg>
							</span>
							<span class='bottom-contact__text'>Telegram</span>
						</a>
						<a
							href={`tel:${contacts.phone495}`}
							class='bottom-contact__link'
							onClick={() => setContactOpen(false)}
						>
							<span class='bottom-contact__icon'>
								<svg {...iconProps}>
									<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.1 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8.03 9.7a16 16 0 0 0 6.27 6.27l1.26-1.25a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z' />
								</svg>
							</span>
							<span class='bottom-contact__text'>
								Позвонить
								<span class='bottom-contact__subtext'>{contacts.phone495String}</span>
							</span>
						</a>
					</div>
				</div>
			)}
		</>
	)
}
