type RadiatorFilterProps = {
	selectedOption: string
	setSelectedOption: (x: string) => void
	options: string[]
	availableOptions: string[]
	title: string
}

function RadiatorFilter({
	title,
	options,
	availableOptions,
	selectedOption,
	setSelectedOption,
}: RadiatorFilterProps) {
	const handleClick = (option: string) => {
		if (option !== selectedOption) {
			setSelectedOption(option)
		}
	}

	return (
		<div class='mt-3 flex flex-wrap items-center gap-1.5'>
			<div class='mr-1 text-sm font-medium text-neutral-700'>{title}:</div>
			<div role='listbox' class='flex flex-wrap gap-1.5' aria-label={`Фильтр по параметру: ${title}`}>
				{options.map(option => {
					const optionSelected = option === selectedOption
					const isOptionAvailable = availableOptions.includes(option)

					return (
						<button
							type='button'
							aria-selected={optionSelected}
							aria-label={`Вариант ${title}: ${option}`}
							role='option'
							disabled={!isOptionAvailable}
							class={`inline-flex h-8 min-w-[44px] items-center justify-center rounded-[3px] border px-2.5 text-xs font-normal transition ${
								optionSelected
									? 'border-red-700 bg-red-700 font-medium text-white'
									: 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400'
							} ${!isOptionAvailable ? 'cursor-not-allowed opacity-40' : ''}`}
							onClick={() => handleClick(option)}
						>
							{option}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default RadiatorFilter
