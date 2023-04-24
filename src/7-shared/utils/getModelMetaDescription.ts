import type { ModelJson } from "@entities/Model"

export const getModelMetaDescription = (model: ModelJson): string => {

  const { name, prefix, orientation } = model
  //TODO add description meta for model

  let title = ''
  title += `${ prefix } Velar ${ name } `

  if (orientation) {
    title += orientation === 'horizontal'
      ? 'горизонтальная модель'
      : orientation === 'vertical'
        ? 'вертикальная модель'
        : ''
  }




  return title.trim()
}