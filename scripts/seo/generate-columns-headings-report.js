#!/usr/bin/env node
import fs from 'node:fs'

const inputPath = process.argv[2]
const outputPath = process.argv[3] || 'reports/columns-headings-new.md'

if (!inputPath) {
	console.error('Usage: node scripts/seo/generate-columns-headings-report.js <headings-json> [output-md]')
	process.exit(1)
}

const headings = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const groups = [1, 2, 3].map(level => ({
	level,
	items: headings.filter(item => item.level === level),
}))

let md = '# /columns headings (new)\n\n'
for (const group of groups) {
	md += `## H${group.level} (${group.items.length})\n\n`
	md += group.items.length ? group.items.map(item => `- ${item.text}`).join('\n') : '- none'
	md += '\n\n'
}

fs.mkdirSync('reports', { recursive: true })
fs.writeFileSync(outputPath, md, 'utf8')
