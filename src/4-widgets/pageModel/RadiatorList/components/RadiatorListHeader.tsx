type Props = {
	showInterAxis: boolean
}

function RadiatorListHeader(prop: Props) {
	const { showInterAxis } = prop

	return (
		<thead>
			<tr class='border-b border-neutral-200 text-white bg-neutral-800'>
				<th
					class='text-xs font-thin py-3 pl-3'
					width={300}
				>
					Наименование
				</th>
				<th class='text-xs font-thin py-3 text-center hidden md:table-cell lg:hidden'>Габариты (ВхДхГ), мм</th>
				<th class='text-xs font-thin py-3 text-center hidden lg:table-cell'>Глубина, мм</th>
				<th class='text-xs font-thin py-3 text-center hidden lg:table-cell'>Высота, мм</th>
				{showInterAxis ? <th class='text-xs font-thin py-3 text-center hidden lg:table-cell'>М/о, мм</th> : null}
				<th class='text-xs font-thin py-3 text-center hidden lg:table-cell'>Длина, мм</th>
				<th class='text-xs font-thin py-3 text-center hidden md:table-cell'>Мощность (Δt=70°C), Вт</th>
				<th
					class='text-xs font-thin py-3'
					width={80}
				>
					Цена, руб
				</th>
				<th width={100}></th>
			</tr>
		</thead>
	)
}

export default RadiatorListHeader
