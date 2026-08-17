type Props = {
  options: { id: string; label: string }[]
  selected: string
  onChange: (value: string) => void
  id: string
}

function Select({ options, selected, onChange, id }: Props) {
  const handleChange = (e: any) => {
    onChange(e.target.value)
  }
  const ssrSafeOptions = selected
    ? options
    : [{ id: "", label: "Выберите параметр" }]

  return (
    <select
      id={id}
      class="relative mt-1 block w-full min-w-0 appearance-none rounded-lg border border-neutral-300 bg-transparent p-3 text-xs focus:ring-1 focus:ring-blue-500"
      role="listbox"
      disabled={!selected}
      onChange={e => handleChange(e)}
    >
      {ssrSafeOptions.map(o => (
        <option
          value={o.id}
          role="option"
          selected={o.id === selected}
          aria-selected={o.id === selected}
        >
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default Select

//TODO add right icon for select
