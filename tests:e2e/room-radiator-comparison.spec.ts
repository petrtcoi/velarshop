import { test, expect } from '@playwright/test'
import radiators from '../src/6-entities/Radiator/jsonData/radiatorsDesign.ts'

const path = '/info/velar-p30v-q40v-r32v-sravnenie'
const expected = [
	{ model: 'p30v', sections: 6, width: 284, projection: 90 },
	{ model: 'q40v', sections: 8, width: 460, projection: 70 },
	{ model: 'r32v', sections: 9, width: 432, projection: 61 },
]
const number = (value: string) => Number(value.replace(/[^\d]/g, ''))

test('comparison fits one heat load using the minimum section count of each series', async ({ page }) => {
	await page.goto(path)
	const rows = page.locator('[data-room-comparison="delta-t-70"] tbody tr')
	await expect(rows).toHaveCount(3)
	for (const [index, spec] of expected.entries()) {
		const configurations = radiators.filter(item => item.model_id === spec.model && Number(item.height) === 1750)
		const adequate = configurations.filter(item => Number(item.dt70) >= 1500).sort((a, b) => Number(a.sections) - Number(b.sections))[0]
		expect(Number(adequate.sections)).toBe(spec.sections)
		const row = rows.nth(index)
		await expect(row.locator('a')).toHaveAttribute('href', `/model/${spec.model}#model-variants`)
		const cells = await row.locator('td').allTextContents()
		expect(number(cells[0])).toBe(spec.sections)
		expect(cells[1]).toBe(`1750 × ${spec.width} мм`)
		expect(number(cells[2])).toBe(spec.projection)
		expect(number(cells[3])).toBe(Number(adequate.dt70))
		expect(number(cells[4])).toBe(Number(adequate.price))
	}
})

test('lower water temperature requires a new selection for the same room', async ({ page }) => {
	await page.goto(path)
	const rows = page.locator('[data-room-comparison="delta-t-50"] tbody tr')
	for (const row of await rows.all()) {
		const cells = await row.locator('td').allTextContents()
		const q70 = number(cells[0]), q50 = number(cells[1])
		expect(q50).toBe(Math.round(q70 * Math.pow(50 / 70, 1.30)))
		expect(q50).toBeLessThan(1500)
		expect(number(cells[2])).toBe(1500)
	}
	await expect(page.getByText(/При ΔT50 ни одно из этих исполнений/)).toBeVisible()
})

test('article metadata, visible FAQ and all three illustrations agree', async ({ page, request }, testInfo) => {
	await page.goto(path)
	await expect(page.locator('h1')).toHaveCount(1)
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://velarshop.ru${path}`)
	const nodes: any[] = []
	const visit = (value: any) => {
		if (!value || typeof value !== 'object') return
		if (value['@type']) nodes.push(value)
		Object.values(value).forEach(item => Array.isArray(item) ? item.forEach(visit) : visit(item))
	}
	for (const raw of await page.locator('script[type="application/ld+json"]').allTextContents()) visit(JSON.parse(raw))
	const article = nodes.find(node => node['@type'] === 'Article')
	expect(article).toBeTruthy()
	expect(JSON.stringify(article.image)).toContain('velar-p30v-6-same-room.webp')
	const faq = nodes.find(node => node['@type'] === 'FAQPage')
	expect(faq.mainEntity).toHaveLength(5)
	for (const question of faq.mainEntity) {
		await expect(page.getByRole('heading', { name: question.name, exact: true })).toBeVisible()
		await expect(page.getByText(question.acceptedAnswer.text, { exact: true })).toBeVisible()
	}
	for (const spec of expected) {
		const image = page.locator(`figure img[src="/images/articles/velar-${spec.model}-${spec.sections}-same-room.webp"]`)
		await image.scrollIntoViewIfNeeded()
		await expect(image).toHaveAttribute('alt', new RegExp(`${spec.sections} секций`))
		await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 1536 && el.naturalHeight === 1024)).toBe(true)
	}
	const links = await page.locator('section a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(el => el.getAttribute('href')!.split('#')[0]))])
	for (const href of links) expect((await request.get(href)).ok(), href).toBe(true)
	await page.locator('[data-room-comparison="delta-t-70"]').scrollIntoViewIfNeeded()
	await page.screenshot({ path: testInfo.outputPath('comparison-desktop.png') })
})

test('mobile comparison scrolls within the table without widening the page', async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(path)
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
	for (const table of await page.locator('[data-room-comparison]').all()) {
		expect(await table.evaluate(el => getComputedStyle(el).overflowX)).toBe('auto')
		expect(await table.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
		await table.evaluate(el => { el.scrollLeft = el.scrollWidth })
		expect(await table.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
	}
	for (const image of await page.locator('figure img').all()) expect(await image.evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(390)
	await page.locator('figure').first().scrollIntoViewIfNeeded()
	await page.screenshot({ path: testInfo.outputPath('comparison-mobile.png') })
})

test('model and category pages lead to the concrete room comparison', async ({ page }) => {
	for (const source of ['/model/p30v', '/model/q40v', '/model/r32v', '/design', '/info/forma-trub-dizayn-radiatorov']) {
		await page.goto(source)
		await expect(page.locator(`a[href="${path}"]`)).toHaveCount(1)
	}
})
