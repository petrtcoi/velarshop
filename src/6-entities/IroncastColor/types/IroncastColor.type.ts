
type IroncastColorType = 'design_ral_any' | 'color_emal' | 'patination' | 'two_colors' | 'design'

export type IroncastColorTypeTitles = {
  id: IroncastColorType,
  title: string
}

export type IroncastColor = {
  id: string
  type_id: IroncastColorType
  name: string
  title: string
  price_section: string
}