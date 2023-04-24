import type { ModelJson } from "@entities/Model"

export const getModelMetaTitle = (model: ModelJson): string => {
  let title = `Velar ${ model.name } - ${ model.prefix.toLowerCase() } | купить по выгодным ценам с доставкой по России | VelarShop.ru`
  return title
}