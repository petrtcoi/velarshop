type RadiatorFilterProps = {
  selectedOption: string
  setSelectedOption: (x: string) => void
  options: string[]
  availableOptions: string[]
  title: string
}
function RadiatorFilter ({
  title,
  options,
  availableOptions,
  selectedOption,
  setSelectedOption
}: RadiatorFilterProps) {


  const handleClick = (option: string) => {
    if (option !== selectedOption) {
      setSelectedOption(option)
    }
  }

  return (
    <div class="mt-5" >
      <div class="font-thin text-xs mb-2">{ title }:</div>
      <div role="listbox" class="flex flex-row gap-2 flex-wrap px-4 items-center" aria-label={ `Фильтр по параметру: ${ title } ` }>
        { options.map((option) => {
          const optionSelected = option === selectedOption
          const isOptionAvailable = availableOptions.includes(option)


          return (
            <div
              aria-selected={ optionSelected }
              aria-label={ `Вариант ${ title }: ${ option }` }
              role="option"
              class={ `
              inline-block 
              text-center
              w-14
              pb-1
              text-xs
              transition-all
              duration-300
              border-b-2
              border-transparent
              ${ optionSelected
                  ? 'border-b-red-600 border-b-2'
                  : 'cursor-pointer hover:border-b-red-300 hover:text-neutral-700'
                } 
              ${ isOptionAvailable
                  ? 'text-neutral-900'
                  : 'text-neutral-400'
                } `
              }
              onClick={ () => handleClick(option) }
            >
              { option }
            </div>
          )
        }) }
      </div >
    </div >
  )
}

export default RadiatorFilter