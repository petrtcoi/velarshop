import { test, expect } from '@playwright/test'

test('delta T calculator uses the chosen catalog configuration and marks extrapolation', async ({ page }) => {
	await page.goto('/info/teplootdacha-radiatora-delta-t-chto-eto')
	await page.getByLabel('Модель для пересчета').selectOption('q40v-10-1750-580')
	await page.getByRole('button', { name: '80/60/20 → ΔT50' }).click()
	await expect(page.getByRole('status')).toHaveText(/1\s*330 Вт/)
	await expect(page.getByRole('note')).toHaveCount(0)
	await page.getByRole('button', { name: '70/55/20 → ΔT42,5' }).click()
	await expect(page.getByRole('note')).toContainText('результат оценочный')
	const power42 = Number((await page.getByRole('status').innerText()).replace(/\D/g, ''))
	expect(power42).toBeGreaterThan(0)
	expect(power42).toBeLessThan(1330)
	await page.getByRole('button', { name: '55/45/20 → ΔT30' }).click()
	const power30 = Number((await page.getByRole('status').innerText()).replace(/\D/g, ''))
	expect(power30).toBeLessThan(power42)
	await page.getByRole('spinbutton', { name: 'Мощность при ΔT70, Вт' }).fill('0')
	await expect(page.getByRole('status')).toHaveText('0 Вт')
})

test('panoramic table includes grille prices rather than pretending base prices are complete', async ({ page }) => {
	await page.goto('/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti')
	const rows = page.locator('section table tbody tr')
	const natural = rows.filter({ has: page.locator('a[href="/model/kwh#model-variants"]') })
	await expect(natural).toContainText(/13\s*572 ₽/)
	await expect(natural).toContainText(/6\s*032 ₽/)
	await expect(natural).toContainText(/19\s*604 ₽/)
	const forced = rows.filter({ has: page.locator('a[href="/model/kwhv#model-variants"]') })
	await expect(forced).toContainText(/38\s*186 ₽/)
	await expect(page.getByText(/это не полный комплект управления и монтажа/)).toBeVisible()
})

test('tube comparison includes the fifth row at the same height and section count', async ({ page }) => {
	await page.goto('/info/2-3-4-trubchatye-radiatory-chto-vybrat')
	await expect(page.locator('h1')).toContainText('5-трубчатые')
	const comparison = page.locator('section table tbody tr')
	await expect(comparison).toHaveCount(4)
	for (const row of await comparison.all()) await expect(row).toContainText('576 × 450 мм, 10 секций')
	await expect(comparison.last()).toContainText('180 мм')
	await expect(page.locator('a[href="/collections/5-trubchatye-radiatory"]')).toBeVisible()
})

test('updated articles and comparisons stay readable on a narrow screen', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	for (const path of ['/info/air-in-radiators', '/info/termostats', '/info/kreplenie-radiatora-k-stene', '/info/teplootdacha-radiatora-delta-t-chto-eto', '/floor', '/convector', '/design']) {
		await page.goto(path)
		await expect(page.locator('h1')).toHaveCount(1)
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true)
	}
})
