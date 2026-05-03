#!/usr/bin/env node
import fs from 'node:fs'

const oldPath = process.argv[2]
const newPath = process.argv[3]
const outputPath = process.argv[4] || 'reports/columns-lost-images.md'

if (!oldPath || !newPath) {
	console.error('Usage: node scripts/seo/generate-columns-lost-images-report.js <old-html> <new-html> [output-md]')
	process.exit(1)
}

function extractImages(html) {
	return [...html.matchAll(/<img\b([^>]*)>/gi)].map(match => {
		const raw = match[1]
		const srcMatch = raw.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
		const altMatch = raw.match(/\balt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
		return {
			src: srcMatch ? srcMatch[2] || srcMatch[3] || srcMatch[4] || '' : '',
			alt: altMatch ? altMatch[2] || altMatch[3] || altMatch[4] || '' : '',
		}
	})
}

const oldImages = extractImages(fs.readFileSync(oldPath, 'utf8'))
const newImages = extractImages(fs.readFileSync(newPath, 'utf8'))
const newSrcSet = new Set(newImages.map(item => item.src))
const lostSrc = [...new Set(oldImages.map(item => item.src).filter(Boolean))].filter(src => !newSrcSet.has(src))

let md = '# Lost images from old /columns\n\n'
if (!lostSrc.length) {
	md += '- none\n'
} else {
	for (const src of lostSrc) {
		const record = oldImages.find(item => item.src === src)
		md += `- src: ${src}\n`
		md += `  alt: ${record?.alt || '—'}\n`
		md += '  needs_return: review\n\n'
	}
}

fs.mkdirSync('reports', { recursive: true })
fs.writeFileSync(outputPath, md, 'utf8')
