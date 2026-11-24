/**
 * Pure helpers for responsive images (shared by ResponsiveImage.astro and ResponsiveImage.tsx).
 *
 * Variants are produced by scripts/images/build_variants.py next to the original:
 *   /images/models/p30v/1.jpg -> /images/models/p30v/1-640.avif, 1-640.webp, 1-1200.avif, 1-1200.webp
 * The manifest (src/lib/imageManifest.json) lists the widths that exist for every original.
 *
 * This module never imports the manifest itself, so client bundles stay small:
 * server code passes the manifest in, islands receive precomputed `variants`.
 */

export type ImageManifestEntry = {
	w: number
	h: number
	variants: number[]
	alpha?: boolean
}

export type ImageManifest = Record<string, ImageManifestEntry>

export type ResponsiveImageFormat = 'avif' | 'webp'

const SITE_HOSTS = new Set(['velarshop.ru', 'www.velarshop.ru'])

/** Public path of a site image ('/images/x/1.jpg'), or null for external / relative / data URLs. */
export function normalizeImageSrc(src: string | undefined | null): string | null {
	if (!src || typeof src !== 'string') return null
	let path = src.trim()
	if (/^https?:\/\//i.test(path)) {
		try {
			const url = new URL(path)
			if (!SITE_HOSTS.has(url.hostname)) return null
			path = url.pathname
		} catch {
			return null
		}
	}
	if (!path.startsWith('/') || path.startsWith('//')) return null
	path = path.split(/[?#]/)[0]
	try {
		path = decodeURI(path)
	} catch {
		// keep the raw path
	}
	return path
}

/** Manifest entry for an image that has AVIF/WebP variants, otherwise undefined. */
export function getImageEntry(manifest: ImageManifest, src: string | undefined | null): ImageManifestEntry | undefined {
	const key = normalizeImageSrc(src)
	if (!key) return undefined
	const entry = manifest[key]
	return entry && entry.variants.length > 0 ? entry : undefined
}

/** Widths available for an image ([] when it has no variants). Use it to pass `variants` to islands. */
export function getImageVariants(manifest: ImageManifest, src: string | undefined | null): number[] {
	return getImageEntry(manifest, src)?.variants ?? []
}

/** Small per-island map { src: widths } so a client component does not need the whole manifest. */
export function pickImageVariants(manifest: ImageManifest, srcs: Array<string | undefined | null>): Record<string, number[]> {
	const map: Record<string, number[]> = {}
	for (const src of srcs) {
		if (!src) continue
		const variants = getImageVariants(manifest, src)
		if (variants.length) map[src] = variants
	}
	return map
}

/** '/images/a/1.jpg', 640, 'avif' -> '/images/a/1-640.avif' */
export function variantPath(src: string, width: number, format: ResponsiveImageFormat): string {
	const path = normalizeImageSrc(src) ?? src
	return path.replace(/\.[a-z0-9]+$/i, `-${width}.${format}`)
}

/** srcset string for one format: '/a/1-640.avif 640w, /a/1-1200.avif 1200w' */
export function buildSrcset(src: string, widths: number[], format: ResponsiveImageFormat): string {
	return [...widths]
		.sort((a, b) => a - b)
		.map(width => `${encodeURI(variantPath(src, width, format))} ${width}w`)
		.join(', ')
}

/** Height that keeps the original aspect ratio for a given rendered width. */
export function heightForWidth(entry: ImageManifestEntry | undefined, width: number | string | undefined): number | undefined {
	const numericWidth = Number(width)
	if (!entry || !numericWidth || !entry.w) return undefined
	return Math.round((numericWidth * entry.h) / entry.w)
}
