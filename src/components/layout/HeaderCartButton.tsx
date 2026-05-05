import { useStore } from '@nanostores/preact'

import { storeCartTotalQnty } from '@features/order/ShoppingCart'

function getGoodsWord(quantity: number) {
	const mod10 = quantity % 10
	const mod100 = quantity % 100

	if (mod10 === 1 && mod100 !== 11) return 'товар'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара'

	return 'товаров'
}

export default function HeaderCartButton() {
	const cartTotalQnty = useStore(storeCartTotalQnty)
	const hasItems = cartTotalQnty > 0
	const badgeText = cartTotalQnty > 99 ? '99+' : String(cartTotalQnty)
	const ariaLabel = hasItems
		? `Открыть корзину, ${cartTotalQnty} ${getGoodsWord(cartTotalQnty)}`
		: 'Открыть корзину'

	return (
		<a
			href='/cart'
			aria-label={ariaLabel}
			rel='nofollow'
			class='relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-[#e5e5e5] bg-white text-[#111] transition-colors hover:border-[#c1121f] hover:bg-white hover:text-[#a30f19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300'
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				aria-hidden='true'
			>
				<circle cx='8' cy='21' r='1'></circle>
				<circle cx='19' cy='21' r='1'></circle>
				<path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'></path>
			</svg>
			{hasItems && (
				<span class='absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c1121f] px-1 text-[10px] font-medium leading-none text-white'>
					{badgeText}
				</span>
			)}
		</a>
	)
}
