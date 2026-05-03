#!/usr/bin/env node
import fs from 'node:fs'

const input = process.argv[2]
if (!input) {
	console.error('Usage: node scripts/seo/extract-headings.js <html-file>')
	process.exit(1)
}

const html = fs.readFileSync(input, 'utf8')
const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
	level: Number(match[1]),
	text: match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
}))

console.log(JSON.stringify(headings, null, 2))
