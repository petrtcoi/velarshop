import type { APIRoute } from 'astro'

import { buildQuickConfiguratorModels } from '@widgets/pageMain/quickConfiguratorData'

// Список моделей для модалки «Поиск и быстрый подбор» в шапке.
// Раньше уходил props'ами в каждую страницу (~47 КБ × 2), теперь HeaderQuickSearch грузит его при первом открытии.
export const get: APIRoute = () => {
	return {
		body: JSON.stringify(buildQuickConfiguratorModels()),
	}
}
