#!/usr/bin/env node
import fs from 'node:fs'

const input = process.argv[2]
if (!input) {
	console.error('Usage: node scripts/seo/extract-jsonld.js <html-file>')
	process.exit(1)
}

const html = fs.readFileSync(input, 'utf8')
const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
	(match, index) => {
		const raw = match[1].trim()
		try {
			const parsed = JSON.parse(raw)
			return { index, ok: true, parsed }
		} catch (error) {
			return { index, ok: false, error: String(error), raw }
		}
	}
)

console.log(JSON.stringify(blocks, null, 2))
