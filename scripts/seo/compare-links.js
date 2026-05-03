#!/usr/bin/env node
import fs from 'node:fs'

const oldPath = process.argv[2]
const newPath = process.argv[3]
if (!oldPath || !newPath) {
	console.error('Usage: node scripts/seo/compare-links.js <old-links.json> <new-links.json>')
	process.exit(1)
}

const oldLinks = JSON.parse(fs.readFileSync(oldPath, 'utf8'))
const newLinks = JSON.parse(fs.readFileSync(newPath, 'utf8'))

const oldSet = new Set(oldLinks.map(item => item.href).filter(Boolean))
const newSet = new Set(newLinks.map(item => item.href).filter(Boolean))

const lost = [...oldSet].filter(href => !newSet.has(href)).sort()
const added = [...newSet].filter(href => !oldSet.has(href)).sort()
const emptyNew = newLinks.filter(item => !item.href || item.href === '#').length

console.log(
	JSON.stringify(
		{
			old: oldSet.size,
			new: newSet.size,
			lost,
			added,
			emptyOrHashInNew: emptyNew,
		},
		null,
		2
	)
)
