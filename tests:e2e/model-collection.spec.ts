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
})
