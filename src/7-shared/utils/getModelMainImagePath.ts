const getModelMainImagePath = (slug: string, isColumnType = false): string => {
	if (isColumnType) {
		return slug.startsWith('5')
			? '/images/news/velar-5-columns.webp'
			: `/images/models/columns/main${slug[0]}b.jpg`
	}

	return `/images/models/${slug}/main.jpg`
}

export { getModelMainImagePath }
