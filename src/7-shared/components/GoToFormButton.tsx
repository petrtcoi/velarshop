import { storeCartTotalQnty } from '@features/order/ShoppingCart'
import { useStore } from '@nanostores/preact'
import { useEffect, useState } from 'preact/hooks'

export function GoToFormButton() {
	const [isOpen, setIsOpen] = useState(false)
	const cartTotalQnty = useStore(storeCartTotalQnty)

	useEffect(() => {
		const pathname = window.location.pathname
		if (pathname === '/request') return
		if (pathname.includes('/accepted')) return
		if (pathname.includes('/success')) return
		if (pathname.includes('/cart')) return

		const toggleButton = () => {
			setIsOpen(window.scrollY > 180)
		}

		toggleButton()
		window.addEventListener('scroll', toggleButton, { passive: true })

		return () => {
			window.removeEventListener('scroll', toggleButton)
		}
	}, [])

	if (isOpen === false) return null
	if (cartTotalQnty > 0) return null

	return (
		<a
			href='/request'
			class='hover:opacity-90 z-100'
		>
			<div class='bg-red-700 z-100 fixed bottom-3 left-3 right-3 md:bottom-0 md:left-0 md:right-auto md:w-[320px] flex flex-col gap-[2px] h-[44px] md:h-[48px] items-center justify-center rounded-xl md:rounded-none md:rounded-tr-xl text-white'>
				<div class='text-[12px] leading-[13px] font-light'>🔥 Узнать цену под мои параметры</div>
				<div class='text-[10px] leading-[10px] font-light'>В мессенджере • в течение дня • без звонков</div>
			</div>
		</a>
	)
}
