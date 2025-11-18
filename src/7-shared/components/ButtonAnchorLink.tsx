type Props = {
	title: string
	anchor: string
}

function ButtonAnchorLink({ title, anchor }: Props) {
	const hrefLink = location.protocol + '//' + location.host + location.pathname + anchor

	return (
		<button
			aria-label='Перейти к списку радиаторов модели'
			class='bg-transparent border-neutral-700 border hover:bg-neutral-900 py-1 px-4 rounded-lg group transition-colors'
			onClick={() => {
				if (!window?.location) return
				window.location.href = hrefLink
			}}
		>
			<span class='text-neutral-700 text-xs relative -top-[1px] group-hover:text-white transition-colors'>{title}</span>
		</button>
	)
}

export default ButtonAnchorLink
