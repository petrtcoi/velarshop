import { expect, test } from '@playwright/test'

test.describe('Collection context on model pages', () => {
	test('applies the interaxial filter and scrolls to variants after hydration', async ({ page }) => {
		await page.goto('/model/p30v?mo=500&connection=side#model-variants')

		await expect(page.getByText('Показаны подходящие конфигурации')).toBeVisible()
		await page.waitForFunction(() => window.scrollY > 100)

		const variantsTop = await page.locator('#model-variants').evaluate(element =>
			Math.round(element.getBoundingClientRect().top),
		)
		expect(variantsTop).toBeGreaterThanOrEqual(0)
		expect(variantsTop).toBeLessThan(180)

		const rows = await page.locator('#radiators-list table tbody tr').allTextContents()
		expect(rows.length).toBeGreaterThan(0)
		expect(rows.every(row => row.includes('500 мм'))).toBe(true)
	})

	test('locks a floor radiator to side connection despite a saved lower connection', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('velarshop_radiator_connection_backup/v1', 'l50')
			localStorage.setItem('velarshop_radiator_connection_active/v1', 'l50')
		})

		await page.goto('/model/p200?mo=500&connection=side#model-variants')

		await expect(page.getByText('Боковое подключение', { exact: true })).toBeVisible()
		await expect(page.locator('#radiators-list table tbody tr').first()).toContainText('БОК')
	})

	test('renders one main landmark on collection pages', async ({ page }) => {
		await page.goto('/collections/radiatory-mezhosevoe-rasstoyanie-500-mm')
		await expect(page.locator('main')).toHaveCount(1)
	})

	test('does not duplicate the collections URL in height breadcrumbs', async ({ page }) => {
		await page.goto('/collections/radiatory-vysotoy-500-mm')

		const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
		await expect(breadcrumbs.locator('li')).toHaveCount(3)
		const labels = await breadcrumbs.locator('li').allTextContents()
		expect(labels.map(label => label.replace(/\s+/g, ' ').trim())).toEqual(['Главная /', 'Подборки /', '500 мм'])

		const hrefs = await breadcrumbs.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')))
		expect(hrefs).toEqual(['/', '/collections'])

		const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
		const schemaNodes = schemas.flatMap(rawSchema => {
			const schema = JSON.parse(rawSchema)
			return Array.isArray(schema['@graph']) ? schema['@graph'] : [schema]
		})
		const breadcrumbSchema = schemaNodes.find(schema => schema['@type'] === 'BreadcrumbList')
		const schemaUrls = breadcrumbSchema.itemListElement.map(item =>
			typeof item.item === 'string' ? item.item : item.item['@id'],
		)
		expect(schemaUrls).toHaveLength(3)
		expect(new Set(schemaUrls).size).toBe(schemaUrls.length)
	})

	test('does not offer a height shortcut when a tubular model has a fixed height', async ({ page }) => {
		await page.goto('/columns/5030')

		const popularLinks = page.getByRole('navigation', { name: 'Популярные подборки для модели' })
		await expect(popularLinks).not.toContainText('Высота 300 мм')
		await expect(popularLinks).toContainText('Все пятитрубчатые радиаторы')
		await expect(popularLinks).toContainText('Все низкие трубчатые')
		await expect(page.getByText('Высота этой модели фиксирована;', { exact: false })).toBeVisible()

		await page.goto('/columns/5180')
		await expect(page.getByRole('navigation', { name: 'Популярные подборки для модели' })).not.toContainText('Высота около 1800 мм')

		await page.goto('/columns/2057')
		await expect(page.getByRole('navigation', { name: 'Популярные подборки для модели' })).toContainText('М/о 500 мм · боковое')

		await page.goto('/model/p30v')
		const designPopularLinks = page.getByRole('navigation', { name: 'Популярные подборки для модели' })
		await expect(designPopularLinks).toContainText('Высота 500 мм')
		await expect(designPopularLinks).toContainText('Высота около 1800 мм')
	})
})
