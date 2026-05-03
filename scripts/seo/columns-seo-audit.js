#!/usr/bin/env node
import fs from 'node:fs'

const oldPath = process.argv[2]
const newPath = process.argv[3]
const outPath = process.argv[4] || 'reports/columns-seo-regression-report.md'

if (!oldPath || !newPath) {
	console.error('Usage: node scripts/seo/columns-seo-audit.js <old-html> <new-html> [out-report]')
	process.exit(1)
}

const read = path => fs.readFileSync(path, 'utf8')
const strip = value => (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const decode = value =>
	(value || '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')

function parseAttrs(input = '') {
	const out = {}
	const regex = /(\w[\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g
	let match
	while ((match = regex.exec(input))) {
		out[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? ''
	}
	return out
}

function getTitle(html) {
	const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
	return match ? decode(strip(match[1])) : ''
}

function getMeta(html) {
	const result = {}
	for (const match of html.matchAll(/<meta\b([^>]*?)>/gi)) {
		const attrs = parseAttrs(match[1])
		const key = (attrs.name || attrs.property || attrs['http-equiv'] || '').toLowerCase()
		if (key && attrs.content !== undefined) result[key] = attrs.content
	}
	const canonicalMatch = html.match(/<link\b([^>]*rel=["']canonical["'][^>]*)>/i)
	if (canonicalMatch) {
		const attrs = parseAttrs(canonicalMatch[1])
		if (attrs.href) result.canonical = attrs.href
	}
	return result
}

function getHeadings(html) {
	return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
		level: Number(match[1]),
		text: decode(strip(match[2])),
	}))
}

function getLinks(html) {
	return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(match => {
		const attrs = parseAttrs(match[1])
		return { href: attrs.href || '', text: decode(strip(match[2])) }
	})
}

function getImages(html) {
	return [...html.matchAll(/<img\b([^>]*)>/gi)].map(match => {
		const attrs = parseAttrs(match[1])
		return { src: attrs.src || '', alt: attrs.alt || '' }
	})
}

function getJsonLdBlocks(html) {
	return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
		match => match[1].trim()
	)
}

function collectSchemaTypes(node, out) {
	if (!node) return
	if (Array.isArray(node)) {
		node.forEach(item => collectSchemaTypes(item, out))
		return
	}
	if (typeof node !== 'object') return
	if (node['@type']) {
		if (Array.isArray(node['@type'])) {
			node['@type'].forEach(type => out.add(String(type)))
		} else {
			out.add(String(node['@type']))
		}
	}
	Object.values(node).forEach(value => collectSchemaTypes(value, out))
}

function getSchemaTypesFromJsonLd(html) {
	const types = new Set()
	const scripts = getJsonLdBlocks(html)
	for (const script of scripts) {
		try {
			const parsed = JSON.parse(script)
			collectSchemaTypes(parsed, types)
		} catch {}
	}
	return { scriptsCount: scripts.length, types: [...types] }
}

function getMicrodata(html) {
	const itemscopeCount = (html.match(/\bitemscope\b/gi) || []).length
	const itemtypes = [...html.matchAll(/itemtype\s*=\s*["']([^"']+)["']/gi)].map(match => match[1])
	return { itemscopeCount, itemtypes }
}

function setDiff(oldSet, newSet) {
	return {
		lost: [...oldSet].filter(item => !newSet.has(item)).sort(),
		added: [...newSet].filter(item => !oldSet.has(item)).sort(),
	}
}

function hasType(types, expected) {
	return types.some(type => String(type).toLowerCase().includes(expected.toLowerCase()))
}

const oldHtml = read(oldPath)
const newHtml = read(newPath)

const oldTitle = getTitle(oldHtml)
const newTitle = getTitle(newHtml)
const oldMeta = getMeta(oldHtml)
const newMeta = getMeta(newHtml)

const oldHeadings = getHeadings(oldHtml)
const newHeadings = getHeadings(newHtml)
const oldH3 = oldHeadings.filter(item => item.level === 3)
const newH3 = newHeadings.filter(item => item.level === 3)

const oldLinks = getLinks(oldHtml)
const newLinks = getLinks(newHtml)
const oldHrefSet = new Set(oldLinks.map(item => item.href).filter(Boolean))
const newHrefSet = new Set(newLinks.map(item => item.href).filter(Boolean))
const linksDiff = setDiff(oldHrefSet, newHrefSet)

const oldImages = getImages(oldHtml)
const newImages = getImages(newHtml)
const imagesDiff = setDiff(
	new Set(oldImages.map(item => item.src).filter(Boolean)),
	new Set(newImages.map(item => item.src).filter(Boolean))
)

const oldJsonLd = getSchemaTypesFromJsonLd(oldHtml)
const newJsonLd = getSchemaTypesFromJsonLd(newHtml)
const oldMicrodata = getMicrodata(oldHtml)
const newMicrodata = getMicrodata(newHtml)

const oldAllSchemaTypes = [
	...new Set([...oldJsonLd.types, ...oldMicrodata.itemtypes.map(type => type.split('/').pop() || type)]),
]
const newAllSchemaTypes = [
	...new Set([...newJsonLd.types, ...newMicrodata.itemtypes.map(type => type.split('/').pop() || type)]),
]

const schemaKeys = ['BreadcrumbList', 'CollectionPage', 'WebPage', 'ItemList', 'Product', 'Offer', 'FAQPage', 'HowTo', 'Organization']
const schemaRegressions = schemaKeys.filter(type => hasType(oldAllSchemaTypes, type) && !hasType(newAllSchemaTypes, type))

const criticalLinks = [
	'/columns/2030',
	'/columns/3030',
	'/columns/4030',
	'/columns/2057',
	'/columns/3057',
	'/columns/4057',
	'/columns/2180',
	'/columns/3180',
	'/info/termostats',
	'/info/column-radiators-pros-cons',
	'/info/tube-radiators',
	'/info/forma-trub-dizayn-radiatorov',
	'/info/kreplenie-radiatora-k-stene',
	'/info/radiator-types',
	'/info/chernye-dizainerskie-radiatory-otopleniya',
	'/info/steel-tube-radiators-guide',
	'/info/kak-chistit-trubchatyj-radiator-otopleniya',
	'/info/raschet-sekciy-trubchatogo-radiatora-uglovaya-komnata',
	'/info/zamena-panelnyh-radiatorov-na-trubchatye-velar',
	'/info/teplootdacha-radiatora-delta-t-chto-eto',
]
const criticalLostLinks = criticalLinks.filter(link => oldHrefSet.has(link) && !newHrefSet.has(link))

const risks = []
if (criticalLostLinks.length) risks.push(`Потеря критических ссылок: ${criticalLostLinks.join(', ')}`)
if (schemaRegressions.length) risks.push(`Потеря schema types: ${schemaRegressions.join(', ')}`)
if ((newMeta.robots || '').toLowerCase().includes('noindex') && !(oldMeta.robots || '').toLowerCase().includes('noindex')) {
	risks.push('Новая версия получила noindex.')
}
if (newHeadings.filter(item => item.level === 1).length !== 1) {
	risks.push(`Нарушение H1: ${newHeadings.filter(item => item.level === 1).length}`)
}

const canonicalChanged = (oldMeta.canonical || '') !== (newMeta.canonical || '')
if (canonicalChanged) risks.push('Canonical изменился, требуется нормализация.')

const status = risks.some(risk => risk.includes('Потеря критических ссылок') || risk.includes('Потеря schema types') || risk.includes('noindex'))
	? 'critical'
	: risks.length
		? 'needs fixes'
		: 'OK'

const h3Preview = newH3.slice(0, 25).map(item => `- ${item.text || '(empty)'}`).join('\n')

const lostImagesList = imagesDiff.lost.map(src => {
	const image = oldImages.find(item => item.src === src)
	return `- src: ${src}\n  alt: ${image?.alt || '—'}`
})

let report = '# /columns SEO Regression Report\n\n'
report += '## Summary\n\n'
report += `- SEO status: **${status}**\n`
report += `- Links old/new: ${oldHrefSet.size} / ${newHrefSet.size}\n`
report += `- Lost links: ${linksDiff.lost.length}\n`
report += `- Critical lost links: ${criticalLostLinks.length}\n`
report += `- JSON-LD scripts old/new: ${oldJsonLd.scriptsCount} / ${newJsonLd.scriptsCount}\n`
report += `- Microdata itemscope old/new: ${oldMicrodata.itemscopeCount} / ${newMicrodata.itemscopeCount}\n\n`

report += '## 1. Meta diff\n\n'
report += '| Field | Old | New | Changed |\n|---|---|---|---|\n'
for (const field of ['title', 'description', 'canonical', 'robots', 'og:title', 'og:description', 'og:url', 'og:image']) {
	const oldValue = field === 'title' ? oldTitle : oldMeta[field] || '—'
	const newValue = field === 'title' ? newTitle : newMeta[field] || '—'
	report += `| ${field} | ${oldValue.replace(/\|/g, '\\|')} | ${newValue.replace(/\|/g, '\\|')} | ${oldValue !== newValue ? 'yes' : 'no'} |\n`
}

report += '\n## 2. Headings diff\n\n'
report += `- H1 old/new: ${oldHeadings.filter(item => item.level === 1).length} / ${newHeadings.filter(item => item.level === 1).length}\n`
report += `- H2 old/new: ${oldHeadings.filter(item => item.level === 2).length} / ${newHeadings.filter(item => item.level === 2).length}\n`
report += `- H3 old/new: ${oldH3.length} / ${newH3.length}\n\n`
report += '### H3 sample (new)\n\n'
report += `${h3Preview || '- none'}\n`

report += '\n## 3. Links diff\n\n'
report += `- total old: ${oldHrefSet.size}\n`
report += `- total new: ${newHrefSet.size}\n`
report += `- lost: ${linksDiff.lost.length}\n`
report += `- added: ${linksDiff.added.length}\n`
report += `- critical lost: ${criticalLostLinks.length}\n`
report += `- href="#" / empty in new: ${newLinks.filter(item => !item.href || item.href === '#').length}\n\n`
report += '### Critical lost links\n\n'
report += criticalLostLinks.length ? `${criticalLostLinks.map(link => `- ${link}`).join('\n')}\n` : '- none\n'

report += '\n## 4. Schema diff\n\n'
report += `- old JSON-LD types: ${oldJsonLd.types.join(', ') || '—'}\n`
report += `- new JSON-LD types: ${newJsonLd.types.join(', ') || '—'}\n`
report += `- schema regressions: ${schemaRegressions.length}\n`
report += `- canonical changed: ${canonicalChanged ? 'yes' : 'no'}\n\n`
report += '| Type | Old | New | Status |\n|---|---|---|---|\n'
for (const type of schemaKeys) {
	const oldHas = hasType(oldAllSchemaTypes, type)
	const newHas = hasType(newAllSchemaTypes, type)
	const state = oldHas === newHas ? 'unchanged' : oldHas ? 'lost' : 'added'
	report += `| ${type} | ${oldHas ? 'yes' : 'no'} | ${newHas ? 'yes' : 'no'} | ${state} |\n`
}

report += '\n## 5. Images diff\n\n'
report += `- old images: ${oldImages.length}\n`
report += `- new images: ${newImages.length}\n`
report += `- lost image src: ${imagesDiff.lost.length}\n`
report += `- added image src: ${imagesDiff.added.length}\n`
report += `- images without alt (new): ${newImages.filter(item => !item.alt || !item.alt.trim()).length}\n`

report += '\n## 6. Lost images review\n\n'
report += lostImagesList.length ? `${lostImagesList.join('\n')}\n` : '- none\n'

report += '\n## 7. Risks\n\n'
report += risks.length ? `${risks.map(risk => `- ${risk}`).join('\n')}\n` : '- Regression-level critical risks not detected.\n'

report += '\n## 8. Follow-up checks\n\n'
report += `### Canonical normalization\n- old: ${oldMeta.canonical || '—'}\n- new: ${newMeta.canonical || '—'}\n\n`
report += '### JSON-LD migration\n'
report += `- old scripts: ${oldJsonLd.scriptsCount}\n- new scripts: ${newJsonLd.scriptsCount}\n- new types: ${newJsonLd.types.join(', ') || '—'}\n\n`
report += '### Microdata removal\n'
report += `- old itemscope: ${oldMicrodata.itemscopeCount}\n- new itemscope: ${newMicrodata.itemscopeCount}\n\n`
report += '### FAQPage validation\n'
report += `- FAQPage in new: ${hasType(newAllSchemaTypes, 'FAQPage') ? 'yes' : 'no'}\n\n`
report += '### HowTo recommendation\n'
report += `- HowTo in new: ${hasType(newAllSchemaTypes, 'HowTo') ? 'yes' : 'no'}\n`

fs.mkdirSync('reports', { recursive: true })
fs.writeFileSync(outPath, report, 'utf8')

const result = {
	status,
	links: {
		old: oldHrefSet.size,
		new: newHrefSet.size,
		lost: linksDiff.lost.length,
		criticalLost: criticalLostLinks.length,
	},
	schema: {
		oldJsonLdScripts: oldJsonLd.scriptsCount,
		newJsonLdScripts: newJsonLd.scriptsCount,
		regressions: schemaRegressions,
	},
	canonical: {
		old: oldMeta.canonical || null,
		new: newMeta.canonical || null,
	},
}

console.log(JSON.stringify(result, null, 2))
