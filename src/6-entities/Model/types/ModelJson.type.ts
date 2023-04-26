

type Orientation = 'vertical' | 'horizontal' | ''
type ModelType = 'design' | 'floor' | 'convector' | 'ironcast'

type ModelJson = {
  id: string
  slug: string
  type: ModelType
  short_comment: string

  name: string
  prefix: string
  connections: string
  related_items: string
  related_models: string
  orientation?: Orientation
}


export type { ModelJson, ModelType }

