const getModelMainImagePath = (slug: string, isColumnType = false): string => {
  return isColumnType
    ? `/images/models/columns/main${slug[0]}.jpg`
    : `/images/models/${slug}/main.jpg`
}

export { getModelMainImagePath }
