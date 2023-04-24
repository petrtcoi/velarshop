type RadiatorJson = {
  model_id: string,
  slug: string,

  sections?: string,
  width: string,
  height: string,
  length: string,

  n_spacing?: string
  e_spacing?: string
  d_spacing?: string

  dt50?: string
  dt60?: string
  dt70?: string

  weight?: string
  volume?: string

  price: string

  related_items?: string

  addon_design_radiators_legs?: string
  addon_stainless_body?: string

  anod_color_grille_price?: string
  premium_grille_price?: string
  wood_grill_price?: string
  basiс_grille_price?: string
}


export type { RadiatorJson }