type Props = {
  options: { id: string; label: string }[]
  selected: string
  onChange: (value: string) => void
  id: string
}

function Select ({ options, selected, onChange, id }: Props)
{

  const handleChange = (e: any) =>
  {
    onChange(e.target.value)
  }

  return (

    <select
      id={ id }
      class='appearance-none w-full bg-transparent sm:w-auto block mt-1 text-xs p-3 border relative border-neutral-300 rounded-lg focus:ring-1 focus:ring-blue-500 '
      role='listbox'
      disabled={ !selected }
      onChange={ (e) => handleChange(e) }
    >
      { options.map((o) => (
        <option
          value={ o.id }
          role='option'
          selected={ o.id === selected }
          aria-selected={ o.id === selected }
        >
          { o.label }
        </option>
      )) }
    </select>

  )
}

export default Select

//TODO add right icon for select