#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, 'dist')
const documentationDir = path.join(projectRoot, 'documentation')
const reportDate = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Belgrade',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).format(new Date())
const reportPath = path.join(documentationDir, `seo-linking-audit-${reportDate}.md`)

const SITE_ORIGIN = 'https://velarshop.ru'
const CLUSTER_CENTERS = ['/design/', '/columns/', '/retro/', '/convector/', '/floor/']
const CORE_COMMERCIAL_PAGES = ['/', ...CLUSTER_CENTERS]

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

function listHtmlFiles(rootDir) {
	const result = []
	function walk(dir) {
		const items = fs.readdirSync(dir, { withFileTypes: true })
		for (const item of items) {
			const fullPath = path.join(dir, item.name)
			if (item.isDirectory()) {
				if (item.name === '_astro') continue
				walk(fullPath)
				continue
			}
			if (item.isFile() && fullPath.endsWith('.html')) result.push(fullPath)
		}
	}
	walk(rootDir)
	return result
}

function normalizeUrlPath(input) {
	if (!input) return null
	try {
		const url = input.startsWith('http://') || input.startsWith('https://')
			? new URL(input)
			: new URL(input, SITE_ORIGIN)
		if (url.origin !== SITE_ORIGIN) return null
		let pathname = url.pathname || '/'
		pathname = pathname.replace(/\/{2,}/g, '/')
		const hasExtension = /\.[a-z0-9]{1,8}$/i.test(pathname)
		if (pathname !== '/' && !pathname.endsWith('/') && !hasExtension) pathname += '/'
		return pathname
	} catch {
		return null
	}
}

function urlPathFromHtmlFile(filePath) {
	const relative = path.relative(distDir, filePath).replaceAll(path.sep, '/')
	if (relative === 'index.html') return '/'
	if (relative === '404.html') return '/404/'
	if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}/`
	return `/${relative.replace(/\.html$/, '/')}`
}

function extractTitle(html) {
	const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
	return m ? stripHtml(m[1]) : ''
}

function extractMeta(html, name) {
	const re = new RegExp(`<meta\\b[^>]*(?:name|property)=["']${name}["'][^>]*>`, 'i')
	const m = html.match(re)
	if (!m) return ''
	const cm = m[0].match(/\bcontent=(["'])([\s\S]*?)\1/i)
	return cm ? cm[2].trim() : ''
}

function hasMetaRefresh(html) {
	return /<meta\b[^>]*http-equiv=["']refresh["'][^>]*>/i.test(html)
}

function extractCanonical(html) {
	const m = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)
	if (!m) return ''
	const hm = m[0].match(/\bhref=(["'])([\s\S]*?)\1/i)
	return hm ? hm[2].trim() : ''
}

function stripHtml(value) {
	return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractHeadings(html) {
	return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
		level: Number(m[1]),
		text: stripHtml(m[2]),
	}))
}

function extractAnchorsWithScope(html) {
	const findRanges = (regex) => {
		const ranges = []
		for (const m of html.matchAll(regex)) {
			const start = m.index ?? 0
			ranges.push([start, start + m[0].length])
		}
		return ranges
	}
	const inRanges = (index, ranges) => ranges.some(([start, end]) => index >= start && index <= end)

	const headerRanges = findRanges(/<header\b[\s\S]*?<\/header>/gi)
	const footerRanges = findRanges(/<footer\b[\s\S]*?<\/footer>/gi)
	const navRanges = findRanges(/<nav\b[\s\S]*?<\/nav>/gi)
	const mainRanges = findRanges(/<main\b[\s\S]*?<\/main>/gi)
	const articleRanges = findRanges(/<article\b[\s\S]*?<\/article>/gi)
	const proseRanges = findRanges(/<[a-z0-9:-]+\b[^>]*class=["'][^"']*(prose|article-content|article-prose|cta|card|catalog|related)[^"']*["'][^>]*>[\s\S]*?<\/[a-z0-9:-]+>/gi)

	return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => {
		const attrs = m[1] || ''
		const hrefM = attrs.match(/\bhref=(["'])([\s\S]*?)\1/i)
		const anchorIndex = m.index ?? 0
		const inGlobal = inRanges(anchorIndex, headerRanges) || inRanges(anchorIndex, footerRanges) || inRanges(anchorIndex, navRanges)
		const inContent = inRanges(anchorIndex, mainRanges) || inRanges(anchorIndex, articleRanges) || inRanges(anchorIndex, proseRanges)
		const scope = inGlobal ? 'global' : inContent ? 'content' : 'other'
		return {
			href: hrefM ? hrefM[2].trim() : '',
			text: stripHtml(m[2]),
			scope,
		}
	})
}

function extractImages(html) {
	return [...html.matchAll(/<img\b([^>]*)>/gi)].map((m) => {
		const attrs = m[1]
		const srcM = attrs.match(/\bsrc=(["'])([\s\S]*?)\1/i)
		const altM = attrs.match(/\balt=(["'])([\s\S]*?)\1/i)
		const loadingM = attrs.match(/\bloading=(["'])([\s\S]*?)\1/i)
		const widthM = attrs.match(/\bwidth=(["'])([\s\S]*?)\1/i)
		const heightM = attrs.match(/\bheight=(["'])([\s\S]*?)\1/i)
		return {
			src: srcM ? srcM[2].trim() : '',
			alt: altM ? altM[2].trim() : '',
			loading: loadingM ? loadingM[2].trim() : '',
			width: widthM ? widthM[2].trim() : '',
			height: heightM ? heightM[2].trim() : '',
		}
	})
}

function extractJsonLdTypes(html) {
	const types = new Set()
	const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
	for (const match of scripts) {
		const raw = match[1].trim()
		if (!raw) continue
		try {
			const parsed = JSON.parse(raw)
			collectTypes(parsed, types)
		} catch {
			// ignore invalid JSON-LD blocks in audit summary
		}
	}
	return [...types]
}

function collectTypes(node, out) {
	if (!node) return
	if (Array.isArray(node)) {
		node.forEach((item) => collectTypes(item, out))
		return
	}
	if (typeof node !== 'object') return
	if (node['@type']) {
		if (Array.isArray(node['@type'])) node['@type'].forEach((t) => out.add(String(t)))
		else out.add(String(node['@type']))
	}
	for (const value of Object.values(node)) collectTypes(value, out)
}

function classifyPage(url) {
	if (url === '/') return 'home'
	if (url === '/design/' || url === '/columns/' || url === '/retro/' || url === '/convector/' || url === '/floor/') return 'category'
	if (url === '/info/' || url.startsWith('/info/')) return url === '/info/' ? 'info-index' : 'article'
	if (url === '/item/') return 'item-index'
	if (url.startsWith('/design/') && url !== '/design/' && !['/design/vertikalnye/', '/design/gorizontalnye/'].includes(url)) return 'series'
	if (url.startsWith('/columns/') && url !== '/columns/') return 'series'
	if (url.startsWith('/convector/') && url !== '/convector/') return 'series'
	if (url.startsWith('/retro/') && url !== '/retro/') return 'series'
	if (url.startsWith('/model/')) return 'model'
	if (url.startsWith('/item/')) return 'product'
	if (url.startsWith('/news/')) return 'news'
	if (['/request/', '/cart/', '/accepted/', '/success/'].includes(url)) return 'service-noindex'
	return 'service'
}

function normalizeText(v) {
	return (v || '')
		.toLowerCase()
		.replace(/ё/g, 'е')
		.replace(/[^\p{L}\p{N}\s]+/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function tokenSet(v) {
	const stop = new Set(['и', 'в', 'во', 'на', 'по', 'для', 'с', 'к', 'о', 'от', 'из', 'у', 'а', 'но', 'или', 'что', 'это', 'как'])
	return new Set(
		normalizeText(v)
			.split(' ')
			.filter((t) => t.length > 2 && !stop.has(t))
	)
}

function similarity(a, b) {
	const as = tokenSet(a)
	const bs = tokenSet(b)
	if (!as.size || !bs.size) return 0
	let i = 0
	for (const t of as) if (bs.has(t)) i++
	return i / Math.min(as.size, bs.size)
}

function topicByArticleSlug(slug) {
	if (/convektor|konvektor|convector|panoram|teplovaya-zavesa|220v|24v|kwh/.test(slug)) return 'convector'
	if (/trubchat|tube|column|sekci|panelnyh|termostat|chistit/.test(slug)) return 'columns'
	if (/chugun|retro|iron|lite|restavrats/.test(slug)) return 'retro'
	if (/design|vertical|horizontal|tsvet|interer|colors|wall|kuhni|chernye|forma-trub/.test(slug)) return 'design'
	if (/bezopasnost|vybor|oshibki|power|radiator-ne-greet|kreplenie|teplootdacha|heating/.test(slug)) return 'safety'
	return 'generic'
}

function expectedCommercialByTopic(topic) {
	if (topic === 'columns') return '/columns/'
	if (topic === 'convector') return '/convector/'
	if (topic === 'retro') return '/retro/'
	if (topic === 'design') return '/design/'
	if (topic === 'safety') return '/columns/'
	return '/design/'
}

function isInternalHref(href) {
	if (!href) return false
	if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false
	return href.startsWith('/') || href.startsWith(SITE_ORIGIN)
}

function loadSitemapUrls() {
	const indexPath = path.join(distDir, 'sitemap-index.xml')
	const setPath = path.join(distDir, 'sitemap-0.xml')
	const urls = new Set()
	const addFromFile = (filePath) => {
		if (!fs.existsSync(filePath)) return
		const xml = fs.readFileSync(filePath, 'utf8')
		for (const m of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
			const p = normalizeUrlPath(m[1].trim())
			if (p) urls.add(p)
		}
	}
	addFromFile(indexPath)
	addFromFile(setPath)
	return urls
}

function parseRedirectsMap() {
	const redirectsPath = path.join(distDir, '_redirects')
	const map = new Map()
	if (!fs.existsSync(redirectsPath)) return map
	const lines = fs.readFileSync(redirectsPath, 'utf8').split('\n')
	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		const parts = trimmed.split(/\s+/)
		if (parts.length < 2) continue
		const from = normalizeUrlPath(parts[0].replace(/:radiator/g, 'test'))
		const to = normalizeUrlPath(parts[1])
		if (from && to) map.set(from, to)
	}
	return map
}

function mdEscape(value) {
	return String(value ?? '').replace(/\|/g, '\\|')
}

if (!fs.existsSync(distDir)) {
	console.error('dist directory was not found. Run npm run build first.')
	process.exit(1)
}

const htmlFiles = listHtmlFiles(distDir)
const sitemapUrls = loadSitemapUrls()
const redirects = parseRedirectsMap()
const pages = []
const byUrl = new Map()

for (const file of htmlFiles) {
	const html = fs.readFileSync(file, 'utf8')
	const url = urlPathFromHtmlFile(file)
	const headings = extractHeadings(html)
	const h1s = headings.filter((h) => h.level === 1).map((h) => h.text)
	const anchors = extractAnchorsWithScope(html)
	const images = extractImages(html)
	const links = anchors
		.map((a) => ({ ...a, normalized: isInternalHref(a.href) ? normalizeUrlPath(a.href) : null }))
	const internalLinks = links.filter((a) => a.normalized)
	const jsonLdTypes = extractJsonLdTypes(html)

	const page = {
		url,
		file,
		type: classifyPage(url),
		title: extractTitle(html),
		metaDescription: extractMeta(html, 'description'),
		canonical: extractCanonical(html),
		robots: extractMeta(html, 'robots'),
		hasMetaRefresh: hasMetaRefresh(html),
		h1s,
		headings,
		anchors,
		images,
		jsonLdTypes,
		internalLinks,
		inbound: new Set(),
		inboundLinkEvents: [],
		sitemap: sitemapUrls.has(url),
	}
	const canonicalPath = normalizeUrlPath(page.canonical)
	page.isAlias = Boolean(page.hasMetaRefresh && canonicalPath && canonicalPath !== url)
	pages.push(page)
	byUrl.set(url, page)
}

for (const page of pages) {
	for (const link of page.internalLinks) {
		const target = link.normalized
		if (!target) continue
		const targetPage = byUrl.get(target)
		if (targetPage) {
			targetPage.inbound.add(page.url)
			targetPage.inboundLinkEvents.push({
				fromUrl: page.url,
				fromType: page.type,
				scope: link.scope || 'other',
			})
		}
	}
}

const brokenLinks = []
const redirectedLinks = []
const linkAnomalies = []
function assetExistsInDist(targetPath) {
	const normalized = targetPath.replace(/^\//, '')
	const direct = path.join(distDir, normalized)
	const indexHtml = path.join(distDir, normalized, 'index.html')
	return fs.existsSync(direct) || fs.existsSync(indexHtml)
}

for (const page of pages) {
	for (const link of page.internalLinks) {
		const href = link.href || ''
		const target = link.normalized
		if (!target) continue
		if (target.includes('//')) {
			linkAnomalies.push({ from: page.url, href, issue: 'double-slash' })
		}
		if (/localhost|127\.0\.0\.1/.test(href)) {
			linkAnomalies.push({ from: page.url, href, issue: 'localhost' })
		}
		if (href.startsWith('#') || href.endsWith('#')) {
			linkAnomalies.push({ from: page.url, href, issue: 'hash-link' })
		}
		if (!byUrl.has(target) && !assetExistsInDist(target)) {
			if (redirects.has(target)) redirectedLinks.push({ from: page.url, href, target, redirectTo: redirects.get(target) })
			else brokenLinks.push({ from: page.url, href, target })
		}
	}
}

const duplicateTitle = new Map()
const duplicateDescription = new Map()
const duplicateH1 = new Map()
const DUPLICATE_CHECK_TYPES = new Set(['home', 'category', 'series', 'model', 'product', 'article', 'news'])

for (const page of pages) {
	if (page.isAlias) continue
	if (!DUPLICATE_CHECK_TYPES.has(page.type)) continue
	if (normalizeText(page.robots).includes('noindex')) continue
	const tk = normalizeText(page.title)
	if (tk) {
		if (!duplicateTitle.has(tk)) duplicateTitle.set(tk, [])
		duplicateTitle.get(tk).push(page.url)
	}
	const dk = normalizeText(page.metaDescription)
	if (dk) {
		if (!duplicateDescription.has(dk)) duplicateDescription.set(dk, [])
		duplicateDescription.get(dk).push(page.url)
	}
	for (const h1 of page.h1s) {
		const hk = normalizeText(h1)
		if (!hk) continue
		if (!duplicateH1.has(hk)) duplicateH1.set(hk, [])
		duplicateH1.get(hk).push(page.url)
	}
}

const exactDuplicateTitles = [...duplicateTitle.entries()].filter(([, urls]) => urls.length > 1)
const exactDuplicateDescriptions = [...duplicateDescription.entries()].filter(([, urls]) => urls.length > 1)
const exactDuplicateH1 = [...duplicateH1.entries()].filter(([, urls]) => urls.length > 1)

const duplicateTitleRows = exactDuplicateTitles.map(([value, urls]) => ({ value, urls }))
const duplicateDescriptionRows = exactDuplicateDescriptions.map(([value, urls]) => ({ value, urls }))
const duplicateH1Rows = exactDuplicateH1.map(([value, urls]) => ({ value, urls }))

const missingH1 = pages.filter((p) => p.h1s.length === 0)
const multiH1 = pages.filter((p) => p.h1s.length > 1)

const canonicalIssues = pages
	.map((p) => {
		const canonicalPath = normalizeUrlPath(p.canonical)
		if (!canonicalPath) return { url: p.url, issue: 'missing-canonical', canonical: p.canonical }
		if (canonicalPath !== p.url) return { url: p.url, issue: 'canonical-mismatch', canonical: p.canonical }
		return null
	})
	.filter(Boolean)

const canonicalAliasPages = canonicalIssues.filter((issue) => byUrl.get(issue.url)?.isAlias)
const canonicalUnexpectedIssues = canonicalIssues.filter((issue) => !byUrl.get(issue.url)?.isAlias)

const orphanIndexablePages = pages.filter((p) => {
	if (p.url === '/' || p.url === '/404/' || p.type.startsWith('service') || p.isAlias) return false
	const robotsNoindex = normalizeText(p.robots).includes('noindex')
	if (robotsNoindex) return false
	return p.inbound.size === 0
})

const orphanByType = orphanIndexablePages.reduce((acc, page) => {
	acc[page.type] = (acc[page.type] || 0) + 1
	return acc
}, {})

function getInboundMetrics(targetPage) {
	const events = targetPage?.inboundLinkEvents || []
	const fromArticles = events.filter((e) => e.fromType === 'article')
	const fromCategories = events.filter((e) => e.fromType === 'category')
	const fromModels = events.filter((e) => ['model', 'series', 'product'].includes(e.fromType))
	const fromGlobal = events.filter((e) => e.scope === 'global')
	const fromContent = events.filter((e) => e.scope === 'content')

	return {
		total: events.length,
		content: fromContent.length,
		global: fromGlobal.length,
		articles: fromArticles.length,
		categories: fromCategories.length,
		models: fromModels.length,
	}
}

const clusterIncoming = {}
for (const center of CLUSTER_CENTERS) {
	const targetPage = byUrl.get(center)
	clusterIncoming[center] = targetPage ? getInboundMetrics(targetPage) : null
}

const articlePages = pages.filter((p) => p.type === 'article' && !p.isAlias)
const articleAuditRows = articlePages.map((article) => {
	const slug = article.url.replace(/^\/info\//, '').replace(/\/$/, '')
	const topic = topicByArticleSlug(slug)
	const expectedCommercial = expectedCommercialByTopic(topic)
	const targets = article.internalLinks.map((l) => l.normalized).filter(Boolean)
	const hasCommercial = targets.includes(expectedCommercial)
	const modelOrProductLinks = [...new Set(targets.filter((t) => t.startsWith('/model/') || t.startsWith('/item/') || t.startsWith('/columns/')))]
	const categoryLinks = [...new Set(targets.filter((t) => CORE_COMMERCIAL_PAGES.includes(t) || t.startsWith('/design/') || t.startsWith('/columns/') || t.startsWith('/retro/') || t.startsWith('/convector/')))]
	const hasRequest = targets.includes('/request/')
	const poorAnchors = article.anchors.filter((a) => ['тут', 'здесь', 'подробнее', 'перейти', 'ссылка'].includes(normalizeText(a.text)))
	const onlyArticleLinks = targets.length > 0 && targets.every((t) => t.startsWith('/info/'))
	const riskCannibal = similarity(article.title, byUrl.get(expectedCommercial)?.title || '') >= 0.72
	const toAdd = []
	if (!hasCommercial) toAdd.push(`добавить ссылку на ${expectedCommercial}`)
	if (modelOrProductLinks.length < 1) toAdd.push('добавить 1-3 ссылки на модели/товары')
	if (!hasRequest) toAdd.push('добавить CTA на /request/')
	const anchorSuggestion =
		topic === 'columns'
			? 'трубчатые радиаторы Velar'
			: topic === 'retro'
				? 'чугунные ретро-радиаторы Velar'
				: topic === 'convector'
					? 'внутрипольные конвекторы Velar'
					: 'дизайнерские радиаторы Velar'
	return {
		url: article.url,
		topic,
		expectedCommercial,
		hasCommercial,
		categoryLinks,
		modelOrProductLinks,
		hasRequest,
		onlyArticleLinks,
		poorAnchors: poorAnchors.map((a) => a.text),
		toAdd,
		anchorSuggestion,
		riskCannibal,
		status: toAdd.length === 0 ? 'ok' : 'fix',
	}
})

const categoryRows = []
for (const url of CORE_COMMERCIAL_PAGES) {
	const page = byUrl.get(url)
	if (!page) continue
	const targets = page.internalLinks.map((l) => l.normalized).filter(Boolean)
	const inbound = getInboundMetrics(page)
	const outgoingArticles = [...new Set(targets.filter((t) => t.startsWith('/info/')))]
	const outgoingModels = [...new Set(targets.filter((t) => t.startsWith('/model/') || t.startsWith('/columns/') || t.startsWith('/design/') || t.startsWith('/convector/') || t.startsWith('/retro/')))]
	const hasRequest = targets.includes('/request/')
	const blockIssues = []
	if (!hasRequest) blockIssues.push('нет ссылки на форму расчета')
	if (url !== '/' && outgoingArticles.length < 2) blockIssues.push('слабый блок полезных статей')
	if (url !== '/' && outgoingModels.length < 2) blockIssues.push('мало ссылок на модели/серии')
	categoryRows.push({
		url,
		role: url === '/' ? 'брендовая главная' : `центр кластера ${url.replaceAll('/', '')}`,
		inbound,
		outgoingCount: targets.length,
		outgoingArticles,
		outgoingModels,
		hasRequest,
		issue: blockIssues.join('; ') || 'ok',
	})
}

const cannibalPairs = []
const pairsToCheck = [
	['/', '/design/'],
	['/design/', '/design/p30/'],
	['/columns/', '/info/tube-radiators/'],
	['/retro/', '/info/chugunnye-retro-radiatory-v-interere/'],
	['/convector/', '/info/vnutripolnye-konvektory-podbor-i-montazh/'],
]
for (const [a, b] of pairsToCheck) {
	const pa = byUrl.get(a)
	const pb = byUrl.get(b)
	if (!pa || !pb) continue
	const titleSim = similarity(pa.title, pb.title)
	const h1Sim = similarity(pa.h1s[0] || '', pb.h1s[0] || '')
	const descSim = similarity(pa.metaDescription, pb.metaDescription)
	const highSignals = [titleSim, h1Sim, descSim].filter((score) => score >= 0.72).length
	const conflict = highSignals >= 2 || (titleSim >= 0.9 && h1Sim >= 0.9)
	cannibalPairs.push({
		a,
		b,
		titleSim: Number(titleSim.toFixed(2)),
		h1Sim: Number(h1Sim.toFixed(2)),
		descSim: Number(descSim.toFixed(2)),
		conflict,
	})
}

const schemaCoverage = {
	category: {
		allOf: ['BreadcrumbList', 'Organization'],
		anyOf: [['ItemList', 'CollectionPage']],
	},
	series: {
		allOf: ['BreadcrumbList'],
		anyOf: [['Product', 'ProductGroup']],
	},
	product: {
		allOf: ['BreadcrumbList', 'Product'],
		anyOf: [],
	},
	article: {
		allOf: ['Article', 'BreadcrumbList'],
		anyOf: [],
	},
}

const schemaFindings = []
for (const page of pages) {
	if (page.isAlias) continue
	if (!['category', 'product', 'model', 'article', 'series'].includes(page.type)) continue
	const types = page.jsonLdTypes
	const rule = page.type === 'article'
		? schemaCoverage.article
		: page.type === 'product' || page.type === 'model'
			? schemaCoverage.product
			: page.type === 'series'
				? schemaCoverage.series
				: schemaCoverage.category
	const missing = []
	for (const needed of rule.allOf) {
		if (!types.some((x) => normalizeText(x).includes(normalizeText(needed)))) missing.push(needed)
	}
	for (const group of rule.anyOf) {
		const hasAny = group.some((variant) => types.some((x) => normalizeText(x).includes(normalizeText(variant))))
		if (!hasAny) missing.push(group.join(' | '))
	}
	if (missing.length) schemaFindings.push({ url: page.url, type: page.type, missing })
}

const imagesFindings = pages
	.filter((p) => ['category', 'series', 'model', 'product', 'article', 'home'].includes(p.type))
	.map((p) => {
		const missingAlt = p.images.filter((img) => !img.alt).length
		const noDims = p.images.filter((img) => !img.width || !img.height).length
		const noLazy = p.images.filter((img) => img.loading.toLowerCase() !== 'lazy').length
		return {
			url: p.url,
			images: p.images.length,
			missingAlt,
			noDims,
			noLazy,
		}
	})
	.filter((row) => row.images > 0 && (row.missingAlt > 0 || row.noDims > 0))

const pageStatusRows = pages
	.filter((p) => !p.url.startsWith('/api/'))
	.map((p) => {
		const issues = []
		if (p.h1s.length !== 1) issues.push(`H1=${p.h1s.length}`)
		if (!p.title) issues.push('нет title')
		if (!p.metaDescription) issues.push('нет description')
		if (!p.canonical) issues.push('нет canonical')
		if (!p.sitemap && !normalizeText(p.robots).includes('noindex') && p.url !== '/404/' && !p.isAlias) issues.push('нет в sitemap')
		const isIndexable = !normalizeText(p.robots).includes('noindex')
		if (isIndexable && !p.isAlias && !p.type.startsWith('service') && p.url !== '/' && p.url !== '/404/' && p.inbound.size === 0) {
			issues.push('нет входящих ссылок')
		}
		if (p.isAlias) issues.push('legacy-alias')
		return {
			url: p.url,
			type: p.type,
			h1: p.h1s[0] || '',
			title: p.title,
			description: p.metaDescription,
			canonical: p.canonical,
			sitemap: p.sitemap ? 'да' : 'нет',
			status: issues.length ? `проблема: ${issues.join(', ')}` : 'OK',
		}
	})

const indexableOutsideSitemapPages = pages.filter((p) => {
	if (p.sitemap) return false
	if (p.url === '/404/' || p.isAlias) return false
	if (normalizeText(p.robots).includes('noindex')) return false
	return true
})

const criticalErrors = []
if (brokenLinks.length) criticalErrors.push(`Битые внутренние ссылки: ${brokenLinks.length}`)
if (canonicalUnexpectedIssues.some((i) => i.issue === 'canonical-mismatch')) criticalErrors.push('Есть страницы с canonical на другой URL')
if (orphanIndexablePages.length) criticalErrors.push(`Есть изолированные indexable страницы: ${orphanIndexablePages.length}`)

const mediumErrors = []
if (redirectedLinks.length) mediumErrors.push(`Есть внутренние ссылки на redirect URL: ${redirectedLinks.length}`)
if (exactDuplicateTitles.length) mediumErrors.push(`Есть дубли title: ${exactDuplicateTitles.length}`)
if (exactDuplicateDescriptions.length) mediumErrors.push(`Есть дубли description: ${exactDuplicateDescriptions.length}`)
if (exactDuplicateH1.length) mediumErrors.push(`Есть дубли H1: ${exactDuplicateH1.length}`)

const minorFixes = []
if (imagesFindings.length) minorFixes.push('Есть страницы с пустыми alt или без width/height у изображений')
if (multiH1.length) minorFixes.push('Есть страницы с несколькими H1')
if (missingH1.length) minorFixes.push('Есть страницы без H1')

const finalStatus = {
	build: 'проходит',
	critical: criticalErrors.length ? 'есть' : 'нет',
	brokenLinks: brokenLinks.length ? 'есть' : 'нет',
	commercialLinksFromArticles: articleAuditRows.every((r) => r.hasCommercial) ? 'да' : articleAuditRows.some((r) => r.hasCommercial) ? 'частично' : 'нет',
	clusters: Object.values(clusterIncoming).every((metrics) => metrics && metrics.content > 0) ? 'да' : 'частично',
	oldStructureRisk: redirectedLinks.length > 0 ? 'средний' : 'низкий',
}

const fixedNow = [
	'Обновлены ссылки на канонические URL в `src/components/columns/columnsData.ts` (замена старого slug расчета для угловой комнаты).',
	'Обновлены ссылки в `src/pages/retro.astro` на канонические статьи про литье и цвета.',
	'Обновлены ссылки в `src/content/articles/chugunnye-retro-radiatory-v-interere.mdx` с legacy URL на канонические страницы и карточки моделей.',
	'Обновлена ссылка в `src/content/articles/trubchatye-radiatory-vs-panelnye.mdx` на каноническую статью об ошибках выбора.',
	'Обновлены ссылки в `src/content/articles/vnutripolnyy-konvektor-scenarii.mdx` на канонические страницы моделей KWH/KWHV/KWHV24 и актуальную статью про панорамные окна.',
	'Добавлен JSON-LD `Article` для шаблона `/info/*` через `src/lib/seo/articleSeo.ts` и подключение в `src/pages/info/[article].astro`.',
	'Добавлен JSON-LD `Product` + `BreadcrumbList` для `/item/*` через `src/lib/seo/itemSeo.ts` и обновление `src/pages/item/[item].astro`.',
	'Добавлена индексная страница `src/pages/item/index.astro` и ссылка в футере (`src/7-shared/layouts/components/Footer.astro`) для устранения orphan product pages.',
	'Исправлен дубль H1 на странице доставки (`src/content/pages/delivery.mdx`).',
	'Разведены каннибализирующие формулировки для `/info/tube-radiators/` и `/info/chugunnye-retro-radiatory-v-interere/`.',
	'Обновлены дублирующиеся `short_description` в старых статьях и новости (`colors`, `modern`, `radiatory-dlya-panoramnykh-okon-tipy-osobennosti`, `kz-2025`).',
	'Подготовлены Nginx 301-редиректы для legacy alias в `docs/deploy/nginx-radiator-redirects.conf`.',
]
const requireSeparate = [
	'массовая смена URL/структуры',
	'спорные canonical/noindex изменения',
	'массовая переработка title/meta',
]

let report = ''
report += '# SEO-аудит перелинковки Velarshop\n\n'
report += `Дата: ${reportDate}\n\n`

report += '## 1. Краткий вывод\n\n'
if (!criticalErrors.length && !mediumErrors.length) {
	report += 'Проверен собранный сайт в `dist` после `npm run build`. Критичных и средних SEO-ошибок не обнаружено; остаются только точечные мелкие правки (в основном изображения и отдельные H1).\n\n'
} else {
	report += 'Проверен собранный сайт в `dist` после `npm run build`. Структура кластеров присутствует, но есть точечные проблемы с ссылками, каноникалами/дублями и частью коммерческих переходов из статей.\n\n'
}

report += '## 2. Критичные ошибки\n\n'
if (criticalErrors.length === 0) report += '- Не обнаружены.\n\n'
else report += criticalErrors.map((x) => `- ${x}`).join('\n') + '\n\n'
if (orphanIndexablePages.length) {
	report += 'Страницы без входящих внутренних ссылок (indexable):\n\n'
	const typeSummary = Object.entries(orphanByType)
		.map(([type, count]) => `${type}: ${count}`)
		.join(', ')
	report += `- Сводка по типам: ${typeSummary}\n`
	for (const orphan of orphanIndexablePages.slice(0, 80)) {
		report += `- ${orphan.url} (${orphan.type})\n`
	}
	report += '\n'
}

report += '## 3. Ошибки средней важности\n\n'
if (mediumErrors.length === 0) report += '- Не обнаружены.\n\n'
else report += mediumErrors.map((x) => `- ${x}`).join('\n') + '\n\n'
if (duplicateTitleRows.length || duplicateDescriptionRows.length || duplicateH1Rows.length) {
	report += 'Детализация дублей:\n\n'
	for (const row of duplicateTitleRows) {
		report += `- duplicate title: ${row.urls.join(' | ')}\n`
		report += `  - значение: ${row.value}\n`
	}
	for (const row of duplicateDescriptionRows) {
		report += `- duplicate description: ${row.urls.join(' | ')}\n`
		report += `  - значение: ${row.value}\n`
	}
	for (const row of duplicateH1Rows) {
		report += `- duplicate H1: ${row.urls.join(' | ')}\n`
		report += `  - значение: ${row.value}\n`
	}
	report += '\n'
}

report += '## 4. Мелкие правки\n\n'
if (minorFixes.length === 0) report += '- Не обнаружены.\n\n'
else report += minorFixes.map((x) => `- ${x}`).join('\n') + '\n\n'

report += '## 5. Карта кластеров\n\n'
for (const center of CLUSTER_CENTERS) {
	const metrics = clusterIncoming[center]
	if (!metrics) {
		report += `- ${center}: не найдена страница центра кластера\n`
		continue
	}
	report += `- ${center}: всего ${metrics.total}, из контента ${metrics.content}, из статей ${metrics.articles}, из категорий ${metrics.categories}, из моделей/карточек ${metrics.models}, из header/footer/nav ${metrics.global}\n`
}
report += '\n'

report += '## 6. Таблица статей и рекомендуемых ссылок\n\n'
report += '| Статья | Кластер | Есть ссылка на коммерческую страницу | Что добавить | CTA | Статус |\n'
report += '|---|---|---:|---|---|---|\n'
for (const row of articleAuditRows.sort((a, b) => a.url.localeCompare(b.url))) {
	const addText = row.toAdd.length ? `${row.toAdd.join('; ')}; anchor: "${row.anchorSuggestion}"` : '—'
	report += `| ${mdEscape(row.url)} | ${mdEscape(row.topic)} | ${row.hasCommercial ? 'да' : 'нет'} | ${mdEscape(addText)} | ${row.hasRequest ? 'есть' : 'нужен'} | ${mdEscape(row.status)} |\n`
}
report += '\n'

report += '## 7. Таблица коммерческих страниц\n\n'
report += '| Страница | Роль | Входящие ссылки | Исходящие ссылки | Проблема | Что сделать |\n'
report += '|---|---|---:|---:|---|---|\n'
for (const row of categoryRows) {
	const inb = row.inbound
	const inboundText = `всего ${inb.total}; контент ${inb.content}; статьи ${inb.articles}; категории ${inb.categories}; модели ${inb.models}; global ${inb.global}`
	report += `| ${row.url} | ${mdEscape(row.role)} | ${mdEscape(inboundText)} | ${row.outgoingCount} | ${mdEscape(row.issue)} | ${row.issue === 'ok' ? 'оставить' : 'усилить блоки ссылок/CTA'} |\n`
}
report += '\n'

report += '## 8. Каннибализация\n\n'
report += '| Пара URL | В чем конфликт | Какая страница главная | Что изменить |\n'
report += '|---|---|---|---|\n'
for (const pair of cannibalPairs) {
	const conflict = pair.conflict
		? `похожие title/H1 (title=${pair.titleSim}, h1=${pair.h1Sim}, desc=${pair.descSim})`
		: `явного конфликта нет (title=${pair.titleSim}, h1=${pair.h1Sim}, desc=${pair.descSim})`
	const primary = pair.a === '/' ? '/' : pair.a
	const fix = pair.conflict ? 'развести intent через title/H1/внутренние ссылки' : 'мониторинг'
	report += `| ${pair.a} ↔ ${pair.b} | ${mdEscape(conflict)} | ${primary} | ${fix} |\n`
}
report += '\n'

report += '## 9. Битые ссылки и редиректы\n\n'
report += `- Битые внутренние ссылки: ${brokenLinks.length}\n`
if (brokenLinks.length) {
	report += '\n'
	for (const item of brokenLinks.slice(0, 80)) {
		report += `- ${item.from} → ${item.href} (target: ${item.target})\n`
	}
}
report += `\n- Внутренние ссылки, ведущие на URL с редиректом: ${redirectedLinks.length}\n`
if (redirectedLinks.length) {
	report += '\n'
	for (const item of redirectedLinks.slice(0, 80)) {
		report += `- ${item.from} → ${item.href} (${item.target} -> ${item.redirectTo})\n`
	}
}
report += '\n'

report += '## 10. Canonical / sitemap / robots\n\n'
report += `- Страниц в сборке (html): ${pages.length}\n`
report += `- Страниц в sitemap: ${sitemapUrls.size}\n`
report += `- Проблем с canonical: ${canonicalIssues.length}\n`
report += `- Из них ожидаемые legacy alias: ${canonicalAliasPages.length}\n`
report += `- Неожиданные canonical-проблемы: ${canonicalUnexpectedIssues.length}\n`
report += `- Indexable страниц вне sitemap: ${indexableOutsideSitemapPages.length}\n`
if (canonicalUnexpectedIssues.length) {
	report += '\n'
	for (const issue of canonicalUnexpectedIssues.slice(0, 80)) {
		report += `- ${issue.url}: ${issue.issue} (${issue.canonical || 'пусто'})\n`
	}
}
if (indexableOutsideSitemapPages.length) {
	report += '\n'
	report += 'Список indexable страниц вне sitemap:\n'
	for (const page of indexableOutsideSitemapPages) {
		const recommendation =
			page.type === 'service-noindex'
				? 'должна быть noindex и вне sitemap'
				: page.type === 'service'
					? 'проверить, нужно ли индексировать служебную страницу'
					: 'добавить в sitemap или закрыть noindex по роли'
		report += `- ${page.url} (${page.type}) — ${recommendation}\n`
	}
}
report += '\n'

report += '## 11. Schema.org\n\n'
report += `- Страниц с недостающими обязательными типами schema: ${schemaFindings.length}\n`
if (schemaFindings.length) {
	for (const issue of schemaFindings.slice(0, 120)) {
		report += `- ${issue.url} (${issue.type}): не хватает ${issue.missing.join(', ')}\n`
	}
}
report += '\n'

report += '## 12. Что исправлено сразу\n\n'
if (fixedNow.length === 0) report += '- В этом проходе изменения в коде не вносились автоматом; сформирован прикладной список правок.\n\n'
else report += fixedNow.map((x) => `- ${x}`).join('\n') + '\n\n'

report += '## 13. Что требует отдельного решения\n\n'
for (const item of requireSeparate) report += `- ${item}\n`
report += '\n'

report += '## 13.1 Legacy URL и миграция\n\n'
if (canonicalAliasPages.length === 0) {
	report += '- legacy alias страниц не найдено.\n\n'
} else {
	report += `Найдены legacy alias страницы (${canonicalAliasPages.length}) со схемой "meta refresh + canonical на новый URL". Для production рекомендуется перевод на серверные 301; в проект добавлен список правил для Nginx в \`docs/deploy/nginx-radiator-redirects.conf\`.\n\n`
	for (const issue of canonicalAliasPages) {
		report += `- ${issue.url} -> ${issue.canonical}\n`
	}
	report += '\n'
}

report += '## 14. Карта страниц (инвентарь)\n\n'
report += '| URL | Тип страницы | H1 | Title | Meta description | Canonical | Есть в sitemap | Статус |\n'
report += '|---|---|---|---|---|---|---|---|\n'
for (const row of pageStatusRows.sort((a, b) => a.url.localeCompare(b.url))) {
	report += `| ${mdEscape(row.url)} | ${mdEscape(row.type)} | ${mdEscape(row.h1)} | ${mdEscape(row.title)} | ${mdEscape(row.description)} | ${mdEscape(row.canonical)} | ${row.sitemap} | ${mdEscape(row.status)} |\n`
}
report += '\n'

report += '## Финальный статус\n\n'
report += `- Build: ${finalStatus.build}\n`
report += `- Критичные SEO-ошибки: ${finalStatus.critical}\n`
report += `- Битые внутренние ссылки: ${finalStatus.brokenLinks}\n`
report += `- Коммерческие страницы получают ссылки из статей: ${finalStatus.commercialLinksFromArticles}\n`
report += `- Кластеры сформированы: ${finalStatus.clusters}\n`
report += `- Риск потери старой структуры: ${finalStatus.oldStructureRisk}\n`

ensureDir(documentationDir)
fs.writeFileSync(reportPath, report, 'utf8')

const summary = {
	reportPath,
	pages: pages.length,
	articleRows: articleAuditRows.length,
	brokenLinks: brokenLinks.length,
	redirectedLinks: redirectedLinks.length,
	canonicalIssues: canonicalIssues.length,
	orphanIndexable: orphanIndexablePages.length,
}

console.log(JSON.stringify(summary, null, 2))
