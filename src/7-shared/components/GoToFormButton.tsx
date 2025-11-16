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
		setIsOpen(true)
	}, [])

	if (isOpen === false) return null
	if (cartTotalQnty > 0) return null

	return (
		<a
			href='/request'
			class='hover:opacity-90 z-100'
		>
			<div class='bg-teal-600 z-100 fixed bottom-0 left-0 right-0  md:w-[320px] flex flex-col gap-[2px] h-[50px] items-center justify-center md:rounded-tr-xl text-white'>
				<div class='text-[12px] leading-[13px] font-light'>🔥 Получить расчет и финальную цену в течение дня</div>
				<div class='text-[10px] leading-[10px font-light'>Пришлем предложение на почту или в мессенджер</div>
			</div>
		</a>
	)
}
