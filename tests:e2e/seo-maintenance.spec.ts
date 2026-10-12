import { test, expect } from '@playwright/test'

test('delta T calculator follows the chosen passport in low temperature operation', async ({ page }) => {
	await page.goto('/info/teplootdacha-radiatora-delta-t-chto-eto')
	await page.getByRole('button', { name: '70/55/20 → ΔT42,5' }).click()
	await expect(page.getByRole('status')).toHaveText('381 Вт')
	await expect(page.getByRole('note')).toContainText('коэффициенту n из паспорта')
	await page.getByRole('button', { name: '55/45/20 → ΔT30' }).click()
	await expect(page.getByRole('status')).toHaveText('234 Вт')
	await page.getByLabel('Модель для пересчета').selectOption('q40v-10-1750-580')
	await page.getByRole('button', { name: '80/60/20 → ΔT50' }).click()
	await expect(page.getByRole('status')).toHaveText(/1\s*330 Вт/)
	await expect(page.getByRole('note')).toHaveCount(0)
	await page.getByRole('spinbutton', { name: 'Мощность при ΔT70, Вт' }).fill('0')
	await expect(page.getByRole('status')).toHaveText('0 Вт')
})

test('panoramic table includes grille prices rather than pretending base prices are complete', async ({ page }) => {
	await page.goto('/info/radiatory-dlya-panoramnykh-okon-tipy-osobennosti')
	const rows = page.locator('section table tbody tr')
	const natural = rows.filter({ has: page.locator('a[href="/model/kwh#model-variants"]') })
	await expect(natural).toContainText('160 × 70 × 1500 мм (Ш × В × Д)')
	await expect(natural).toContainText(/13\s*572 ₽/)
	await expect(natural).toContainText(/6\s*032 ₽/)
	await expect(natural).toContainText(/19\s*604 ₽/)
	const forced = rows.filter({ has: page.locator('a[href="/model/kwhv#model-variants"]') })
	await expect(forced).toContainText(/38\s*186 ₽/)
	await expect(forced).toContainText('С вентилятором; скорость')
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


test('base model dimensions and grille scope match its Product Offer', async ({ page }) => {
	await page.goto('/model/kwh')
	await expect(page.getByText('Цена прибора без решетки', { exact: true })).toBeVisible()
	await expect(page.getByLabel('Фильтр по параметру: Ширина короба (мм)')).toBeVisible()
	await expect(page.locator('#radiators-list')).toContainText('160 × 70 × 600 мм (Ш × В × Д)')
	await expect(page.locator('#model-specs')).toContainText('внутрипольный, в подготовленную нишу')
	await expect(page.getByText(/Базовое исполнение:/)).toContainText('160 × 70 × 600 мм (Ш × В × Д)')
	const raw = await page.locator('script[type="application/ld+json"]').allTextContents()
	const nodes = raw.flatMap(text => JSON.parse(text)['@graph'] ?? [])
	const product = nodes.find(node => node['@type'] === 'Product')
	expect(product.size).toBe('160 × 70 × 600 мм (Ш × В × Д)')
	expect(product.offers.description).toContain('без решетки')
	await page.goto('/columns/2057')
	await expect(page.getByText(/Базовое исполнение:/)).toContainText('4 секции')
	await page.goto('/model/p30v')
	await expect(page.getByText(/Базовое исполнение:/)).toContainText('2 секции')
})

test('list pages keep ItemList and FAQ without model Product offers', async ({ page }) => {
	for (const path of ['/columns', '/design', '/floor', '/convector', '/design/vertikalnye', '/design/p30', '/collections/3-trubchatye-radiatory']) {
		await page.goto(path)
		const raw = await page.locator('script[type="application/ld+json"]').allTextContents()
		const types: string[] = []
		const visit = value => { if (!value || typeof value !== 'object') return; if (value['@type']) types.push(value['@type']); Object.values(value).forEach(v => Array.isArray(v) ? v.forEach(visit) : visit(v)) }
		raw.forEach(text => visit(JSON.parse(text)))
		expect(types, path).toContain('ItemList')
		expect(types.some(type => ['Product', 'ProductGroup', 'Offer'].includes(type)), path).toBe(false)
	}
})

test('mobile schematics retain native text size inside a scroll container', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	for (const [path, name, width] of [['air-in-radiators', 'air-bleeding-steps', 640], ['termostats', 'thermostat-position', 760]] as const) {
		await page.goto('/info/' + path)
		const image = page.locator(`img[src="/images/articles/${name}.svg"]`)
		expect(await image.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(width)
		expect(await image.locator('..').evaluate(el => getComputedStyle(el).overflowX)).toBe('auto')
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
	}
})
