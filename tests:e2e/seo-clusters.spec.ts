import { expect, test, type Page } from '@playwright/test'

async function schemaNodes(page: Page) {
	const raw = await page.locator('script[type="application/ld+json"]').allTextContents()
	const nodes: any[] = []
	const visit = (value: any) => {
		if (!value || typeof value !== 'object') return
		if (value['@type']) nodes.push(value)
		Object.values(value).forEach(child => Array.isArray(child) ? child.forEach(visit) : visit(child))
	}
	raw.forEach(text => visit(JSON.parse(text)))
	return nodes
}

test('horizontal cards and offers use horizontal model prices and destinations', async ({ page }) => {
	await page.goto('/design/gorizontalnye')
	await expect(page.locator('#series-p30 > a')).toHaveAttribute('href', '/model/p30h')
	await expect(page.locator('#series-p30')).toContainText(/12\s*440/)
	const nodes = await schemaNodes(page)
	expect(nodes.some(node => node['@type'] === 'ProductGroup')).toBe(false)
	const products = nodes.filter(node => node['@type'] === 'Product')
	expect(products.length).toBe(10)
	expect(products.every(product => product.sku.endsWith('h'))).toBe(true)
	const p30 = products.find(product => product.sku === 'p30h')
	expect(p30.offers.lowPrice).toBe('12440')
	expect(p30.image).toMatch(/\/p30h\/main\.jpg$/)
	expect(products.every(product => product.offers.offerCount > 0 && Number(product.offers.highPrice) >= Number(product.offers.lowPrice))).toBe(true)
	expect(products.every(product => product.offers.availability === 'https://schema.org/PreOrder')).toBe(true)
})

test('1800 collection keeps nearest height, price and click destination consistent', async ({ page }) => {
	await page.goto('/collections/verticalnye-radiatory-1800-mm')
	const row = page.locator('[data-vertical-row]').filter({ has: page.locator('a[href="/model/p30v"]') })
	await expect(row).toContainText(/1\s*750 мм/)
	await expect(row).toContainText(/18\s*527/)
	await expect(row).not.toContainText(/10\s*652/)
	await expect(row).not.toContainText('по расчету')
	await row.getByRole('link', { name: 'Выбрать размер' }).click()
	await expect(page).toHaveURL(/\/model\/p30v\?height=1750&collection=vertical-1800/)
	await expect(page.getByText('Показаны подходящие конфигурации')).toBeVisible()
})

test('retro examples distinguish full height, spacing, complete price and material', async ({ page }) => {
	await page.goto('/retro')
	const historic = page.locator('#retro-technical-comparison tbody tr').filter({ has: page.locator('a[href="/model/historic500"]') })
	await expect(historic).toContainText('500 мм')
	await expect(historic).toContainText('645 мм')
	const nostalgia10 = page.locator('#retro-price-examples tbody tr').nth(5)
	await expect(nostalgia10).toContainText('660 мм')
	await expect(nostalgia10).toContainText(/69\s*000/)
	await expect(nostalgia10).toContainText('98 кг')
	await page.goto('/model/historic500')
	await expect(page.locator('#model-specs')).toContainText('чугун')
	await expect(page.getByText('Рабочее давление 10 атм', { exact: true })).toBeVisible()
})

test('consolidated article retains both sets of visible FAQ in one schema', async ({ page }) => {
	await page.goto('/info/trubchatye-radiatory-vs-panelnye')
	const faqs = (await schemaNodes(page)).filter(node => node['@type'] === 'FAQPage')
	expect(faqs).toHaveLength(1)
	expect(faqs[0].mainEntity).toHaveLength(15)
	const names = faqs[0].mainEntity.map(question => question.name)
	expect(new Set(names).size).toBe(15)
	for (const name of names) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
	await expect(page.getByRole('heading', { name: 'Можно ли добавить или убрать мощность у панельного и трубчатого радиатора', exact: true })).toBeVisible()
})

test('commercial pages keep tables inside their own scroll area on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	for (const path of ['/columns', '/design/gorizontalnye', '/design/vertikalnye', '/retro', '/collections/verticalnye-radiatory-1800-mm', '/collections/3-trubchatye-radiatory']) {
		await page.goto(path)
		await expect(page.locator('h1')).toHaveCount(1)
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true)
	}
})
