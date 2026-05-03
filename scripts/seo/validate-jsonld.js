#!/usr/bin/env node
import fs from 'node:fs'

const input = process.argv[2]
if (!input) {
	console.error('Usage: node scripts/seo/validate-jsonld.js <html-file>')
	process.exit(1)
}

const html = fs.readFileSync(input, 'utf8')
const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
	match => match[1].trim()
)

if (!scripts.length) {
	console.error('No JSON-LD blocks found')
	process.exit(1)
}

function collectTypes(node, out) {
	if (!node) return
	if (Array.isArray(node)) {
		node.forEach(item => collectTypes(item, out))
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
	Object.values(node).forEach(value => collectTypes(value, out))
}

const parsed = []
for (const script of scripts) {
	try {
		parsed.push(JSON.parse(script))
	} catch (error) {
		console.error('Invalid JSON-LD:', String(error))
		process.exit(1)
	}
}

const allTypes = new Set()
parsed.forEach(item => collectTypes(item, allTypes))

const requiredTopLevelTypes = ['BreadcrumbList', 'CollectionPage', 'ItemList', 'FAQPage', 'HowTo']
const missing = requiredTopLevelTypes.filter(type => !allTypes.has(type))

const hasProduct = allTypes.has('Product')
const hasOffer = allTypes.has('Offer')

if (!hasProduct || !hasOffer) {
	console.error(`Missing nested types: Product=${hasProduct}, Offer=${hasOffer}`)
	process.exit(1)
}

if (missing.length) {
	console.error(`Missing required types: ${missing.join(', ')}`)
	process.exit(1)
}

console.log(
	JSON.stringify(
		{
			jsonLdBlocks: scripts.length,
			types: [...allTypes].sort(),
			status: 'ok',
		},
		null,
		2
	)
)
