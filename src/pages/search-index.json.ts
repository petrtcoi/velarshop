import type { APIRoute } from 'astro'

import { buildSearchIndex } from '../lib/searchIndex'

export const get: APIRoute = async () => {
	const index = await buildSearchIndex()
	return {
		body: JSON.stringify(index),
	}
}
