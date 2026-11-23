import { useStore } from '@nanostores/preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { storeCartTotalQnty } from '@features/order/ShoppingCart'
import { contacts } from '@shared/constants/contacts'
import { reachMetrikaGoal } from '@shared/utils/metrika'

import { getGoodsWord } from './HeaderCartButton'

// Bottom bar for phones (<= 900 px, the same breakpoint as the mobile header).
// Styles: .mobile-bottom-nav* and .bottom-contact* in src/7-shared/styles/global.css.

type Props = {
	currentPath?: string
}

// Listened by the phone instance of HeaderQuickSearch in Header.astro
const QUICK_SEARCH_OPEN_EVENT = 'velar:open-quick-search'

// Drawer "Написать": duration mirrors the transitions of .bottom-contact* in global.css (vaul-like bottom sheet)
const DRAWER_DURATION_MS = 280
// Swipe down: close after 25% of the panel height or a fast flick (px per ms)
const DRAG_CLOSE_RATIO = 0.25
const DRAG_CLOSE_VELOCITY = 0.4
const DRAG_START_THRESHOLD_PX = 4

type DragState = {
	pointerId: number
	startY: number
	lastY: number
	lastTime: number
	velocity: number
	offset: number
	active: boolean
}

function prefersReducedMotion(): boolean {
	return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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
	// contactMounted: drawer is in the DOM (also during the exit animation); contactOpen: drawer is shown / slid up
	const [contactMounted, setContactMounted] = useState(false)
	const [contactOpen, setContactOpen] = useState(false)
	const contactButtonRef = useRef<HTMLButtonElement>(null)
	const firstContactLinkRef = useRef<HTMLAnchorElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)
	const backdropRef = useRef<HTMLButtonElement>(null)
	const closeTimerRef = useRef(0)
	const openFrameRef = useRef(0)
	const openFallbackRef = useRef(0)
	const dragRef = useRef<DragState | null>(null)
	const suppressClickRef = useRef(false)

	const hasItems = cartTotalQnty > 0
	const badgeText = cartTotalQnty > 99 ? '99+' : String(cartTotalQnty)
	const isCartPage = currentPath.replace(/\/+$/, '') === '/cart'

	const resetDragStyles = () => {
		const panel = panelRef.current
		if (panel) {
			panel.style.transition = ''
			panel.style.transform = ''
		}
		if (backdropRef.current) {
			backdropRef.current.style.transition = ''
			backdropRef.current.style.opacity = ''
		}
	}

	// Slides the panel down and fades the backdrop, then unmounts
	const closeContact = (restoreFocus = true) => {
		window.cancelAnimationFrame(openFrameRef.current)
		window.clearTimeout(openFallbackRef.current)
		window.clearTimeout(closeTimerRef.current)
		dragRef.current = null
		resetDragStyles()
		setContactOpen(false)
		closeTimerRef.current = window.setTimeout(
			() => setContactMounted(false),
			prefersReducedMotion() ? 0 : DRAWER_DURATION_MS
		)
		if (restoreFocus) contactButtonRef.current?.focus({ preventScroll: true })
	}

	const handlePanelPointerDown = (event: PointerEvent) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		suppressClickRef.current = false
		dragRef.current = {
			pointerId: event.pointerId,
			startY: event.clientY,
			lastY: event.clientY,
			lastTime: event.timeStamp,
			velocity: 0,
			offset: 0,
			active: false,
		}
	}

	const handlePanelPointerMove = (event: PointerEvent) => {
		const drag = dragRef.current
		const panel = panelRef.current
		if (!drag || !panel || drag.pointerId !== event.pointerId) return

		const delta = event.clientY - drag.startY
		if (!drag.active) {
			if (Math.abs(delta) < DRAG_START_THRESHOLD_PX) return
			drag.active = true
			panel.setPointerCapture?.(event.pointerId)
			panel.style.transition = 'none'
			if (backdropRef.current) backdropRef.current.style.transition = 'none'
		}

		const elapsed = event.timeStamp - drag.lastTime
		if (elapsed > 0) drag.velocity = (event.clientY - drag.lastY) / elapsed
		drag.lastY = event.clientY
		drag.lastTime = event.timeStamp

		// Down: follow the finger; up: small resistance instead of lifting the panel off the bottom edge
		drag.offset = delta > 0 ? delta : -Math.sqrt(-delta) * 2
		panel.style.transform = `translateY(${drag.offset}px)`
		if (backdropRef.current && delta > 0) {
			backdropRef.current.style.opacity = String(Math.max(0, 1 - delta / panel.offsetHeight))
		}
	}

	const handlePanelPointerEnd = (event: PointerEvent) => {
		const drag = dragRef.current
		const panel = panelRef.current
		if (!drag || drag.pointerId !== event.pointerId) return
		dragRef.current = null
		if (!drag.active || !panel) return

		suppressClickRef.current = true
		if (panel.hasPointerCapture?.(event.pointerId)) panel.releasePointerCapture(event.pointerId)

		const shouldClose =
			event.type !== 'pointercancel' &&
			(drag.offset > panel.offsetHeight * DRAG_CLOSE_RATIO || drag.velocity > DRAG_CLOSE_VELOCITY)

		if (shouldClose) {
			closeContact()
			return
		}
		// Snap back: the CSS transition animates from the current offset to translateY(0)
		resetDragStyles()
	}

	// A drag that started on a link must not open it
	const handlePanelClickCapture = (event: MouseEvent) => {
		if (!suppressClickRef.current) return
		event.preventDefault()
		event.stopPropagation()
		suppressClickRef.current = false
	}

	useEffect(
		() => () => {
			window.clearTimeout(closeTimerRef.current)
			window.cancelAnimationFrame(openFrameRef.current)
		},
		[]
	)

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
		if (!contactMounted) return

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
	}, [contactMounted])

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
		window.clearTimeout(closeTimerRef.current)
		window.cancelAnimationFrame(openFrameRef.current)
		setContactMounted(true)
		// Two frames: the panel is painted at translateY(100%) first, so the slide-up transition runs
		openFrameRef.current = window.requestAnimationFrame(() => {
			openFrameRef.current = window.requestAnimationFrame(() => setContactOpen(true))
		})
		// Fallback: requestAnimationFrame may not fire in throttled or background tabs
		window.clearTimeout(openFallbackRef.current)
		openFallbackRef.current = window.setTimeout(() => setContactOpen(true), 60)
	}

	// messenger_click is fired by the global wa.me / t.me / vk.me click listener in Layout.astro,
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
							class={`mobile-bottom-nav__item${isCartPage ? ' is-active' : ''}`}
							aria-current={isCartPage ? 'page' : undefined}
							onClick={() => reachMetrikaGoal('bottom_nav_request')}
						>
							<span class='mobile-bottom-nav__icon'>
								<svg {...iconProps}>
									<circle
										cx='8'
										cy='21'
										r='1'
									/>
									<circle
										cx='19'
										cy='21'
										r='1'
									/>
									<path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
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
							<span class='mobile-bottom-nav__label'>Корзина</span>
							{hasItems && (
								<span class='sr-only'>
									, {cartTotalQnty} {getGoodsWord(cartTotalQnty)}
								</span>
							)}
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

			{contactMounted && (
				<div class={`bottom-contact${contactOpen ? ' is-open' : ''}`}>
					<button
						type='button'
						class='bottom-contact__backdrop'
						aria-label='Закрыть'
						tabIndex={-1}
						ref={backdropRef}
						onClick={() => closeContact()}
					></button>
					<div
						class='bottom-contact__panel'
						role='dialog'
						aria-modal='true'
						aria-labelledby='bottom-contact-title'
						ref={panelRef}
						onPointerDown={handlePanelPointerDown}
						onPointerMove={handlePanelPointerMove}
						onPointerUp={handlePanelPointerEnd}
						onPointerCancel={handlePanelPointerEnd}
						onClickCapture={handlePanelClickCapture}
					>
						<div
							class='bottom-contact__handle'
							aria-hidden='true'
						></div>
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
								onClick={() => closeContact()}
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
							onClick={() => closeContact(false)}
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
							onClick={() => closeContact(false)}
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
							href={contacts.vkMessage}
							target='_blank'
							rel='noopener noreferrer nofollow'
							class='bottom-contact__link'
							onClick={() => closeContact(false)}
						>
							<span class='bottom-contact__icon'>
								<svg {...iconProps}>
									<path d='M3 7l3.5 10L10 7' />
									<path d='M13.5 7v10' />
									<path d='M20.5 7l-7 5.5' />
									<path d='M15.8 10.7L21 17' />
								</svg>
							</span>
							<span class='bottom-contact__text'>ВКонтакте</span>
						</a>
					</div>
				</div>
			)}
		</>
	)
}
