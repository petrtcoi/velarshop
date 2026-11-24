import { useStore } from '@nanostores/preact'
import { useEffect } from 'preact/hooks'

import ColorSwatches from '@shared/components/ColorSwatches'
import { designColors } from '@entities/DesignColor'
import { designColorId as storeDesignColorId } from '../store/designColor'

function SelectDesignColor() {
	const designColorId = useStore(storeDesignColorId)
	const options = designColors.map(color => ({
		id: color.id,
		label: (
			`${color.title} ` +
			(color.multiplicate === 1
				? ''
				: `(+${Math.round((color.multiplicate - 1) * 100)}%)`)
		).trim(),
	}))

	useEffect(() => {
		if (!storeDesignColorId.get()) storeDesignColorId.set(designColors[0].id)
	}, [])

	const handleChange = (id: string) => {
		storeDesignColorId.set(id)
	}

	return (
		<div class='mt-5 mb-2'>
			<div
				id='select_design_radiator_color_label'
				class='block text-xs font-thin'
			>
				Цвет радиатора:
			</div>
			<ColorSwatches
				options={options}
				selected={designColorId}
				onChange={handleChange}
				labelledBy='select_design_radiator_color_label'
			/>
		</div>
	)
}

export default SelectDesignColor
