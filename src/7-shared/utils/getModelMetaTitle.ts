import type { ModelJson } from "@entities/Model"

export const getModelMetaTitle = (model: ModelJson): string => {
  let title = `Velar ${ model.name } купить с доставкой по России | ${ model.prefix.toLowerCase() } | VelarShop.ru`
  return title
}