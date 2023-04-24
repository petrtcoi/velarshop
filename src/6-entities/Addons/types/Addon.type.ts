type AddonId = 'addon_design_radiators_legs' | 'addon_stainless_body'

type Addon = {
  id: AddonId
  code: string
  title: string
}

export type { Addon }