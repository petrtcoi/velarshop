type Props = {
  title: string
  anchor: string
}

function ButtonAnchorLink ({ title, anchor }: Props) {

  const hrefLink = location.protocol + '//' + location.host + location.pathname + anchor


  return (
    <button
      aria-label="Перейти к списку радиаторов модели"
      class='bg-transparent border-red-600 border hover:bg-red-600 py-1 px-4 rounded-lg group transition-colors'
      onClick={ () => {
        if (!window?.location) return
        window.location.href = hrefLink
      } }
    >
      <span class="text-red-600 text-xs group-hover:text-white transition-colors">{ title }</span>
    </button>
  )
}

export default ButtonAnchorLink



