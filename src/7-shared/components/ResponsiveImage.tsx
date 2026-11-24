import type { JSX } from 'preact'
import { buildSrcset } from '../../lib/responsiveImage'

/**
 * Preact version of ResponsiveImage.astro for islands.
 *
 * It does not import src/lib/imageManifest.json (keeps client bundles small).
 * The Astro parent passes the widths that exist for the image:
 *
 *   import manifest from '../../lib/imageManifest.json'
 *   import { getImageVariants } from '../../lib/responsiveImage'
 *   <Island imageVariants={getImageVariants(manifest, src)} />   // or pickImageVariants(manifest, [...srcs])
 *
 * Without `variants` (or with an empty array) it renders a plain <img>.
 */
type Props = Omit<JSX.HTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'srcset' | 'sizes' | 'loading' | 'class'> & {
	src: string
	alt?: string
	class?: string
	imgClass?: string
	pictureClass?: string
	sizes?: string
	loading?: 'eager' | 'lazy'
	fetchpriority?: 'high' | 'low' | 'auto'
	/** Widths from the image manifest, e.g. [640, 1200]. */
	variants?: number[]
}

export default function ResponsiveImage({
	src,
	alt = '',
	class: className,
	imgClass,
	pictureClass,
	sizes = '100vw',
	loading = 'lazy',
	decoding = 'async',
	variants,
	...attrs
}: Props) {
	const imgClassName = [className, imgClass].filter(Boolean).join(' ') || undefined
	const img = <img {...attrs} src={src} alt={alt} class={imgClassName} loading={loading} decoding={decoding} />

	if (!variants || variants.length === 0) return img

	return (
		<picture class={['rimg', pictureClass].filter(Boolean).join(' ')}>
			<source type='image/avif' srcSet={buildSrcset(src, variants, 'avif')} sizes={sizes} />
			<source type='image/webp' srcSet={buildSrcset(src, variants, 'webp')} sizes={sizes} />
			{img}
		</picture>
	)
}
