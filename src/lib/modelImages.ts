import fs from 'node:fs'
import path from 'node:path'
import manifest from './imageManifest.json'
import type { ImageManifest } from './responsiveImage'

/**
 * Original photos of a model folder (/images/models/<folder>/*), served from /public
 * by their own path (not re-imported through Vite, which used to copy every photo
 * into /_astro with a hash and bypass the AVIF/WebP variants).
 *
 * Generated variants (<name>-640.avif, <name>-1200.webp, ...) are skipped.
 * Photos added without running scripts/images/build_variants.py are still listed
 * (rendered as a plain <img> until the script is run).
 */

const images = manifest as ImageManifest
const SOURCE_RE = /\.(jpe?g|png|webp|avif)$/i
const VARIANT_RE = /^(.+)-\d{2,4}\.(avif|webp)$/i

export type ModelFolderImage = { src: string; width?: number; height?: number }

function listFolder(folder: string): string[] {
	const prefix = `/images/models/${folder}/`
	try {
		const dir = path.join(process.cwd(), 'public', 'images', 'models', folder)
		const files = fs.readdirSync(dir, { withFileTypes: true })
			.filter(entry => entry.isFile() && SOURCE_RE.test(entry.name) && !entry.name.startsWith('.'))
			.map(entry => entry.name)
		const stems = new Set(files.map(name => name.replace(/\.[^.]+$/, '')))
		return files
			.filter(name => {
				const match = name.match(VARIANT_RE)
				return !(match && stems.has(match[1]))
			})
			.map(name => prefix + name)
	} catch {
		return Object.keys(images).filter(key => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
	}
}

export function getModelFolderImages(folder: string): ModelFolderImage[] {
	return listFolder(folder)
		.sort((a, b) => a.localeCompare(b))
		.map(src => {
			const entry = images[src]
			return entry ? { src, width: entry.w, height: entry.h } : { src }
		})
}
