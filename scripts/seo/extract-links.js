#!/usr/bin/env node
import fs from 'node:fs'

const input = process.argv[2]
if (!input) {
	console.error('Usage: node scripts/seo/extract-links.js <html-file>')
	process.exit(1)
}

const html = fs.readFileSync(input, 'utf8')
const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(match => {
	const attrs = match[1]
	const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
	const href = hrefMatch ? hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || '' : ''
	const text = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
	return { href, text }
})

console.log(JSON.stringify(links, null, 2))
