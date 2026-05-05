import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel'

type GalleryRoot = HTMLElement & {
	_emblaGallery?: EmblaCarouselType
}

function initProductGallery(root: GalleryRoot) {
	if (root.dataset.galleryReady === 'true') return

	const viewport = root.querySelector<HTMLElement>('[data-product-gallery-main]')
	const thumbs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-product-gallery-thumb]'))
	const previousButton = root.querySelector<HTMLButtonElement>('[data-product-gallery-prev]')
	const nextButton = root.querySelector<HTMLButtonElement>('[data-product-gallery-next]')

	if (!viewport || thumbs.length <= 1) {
		root.dataset.galleryReady = 'true'
		return
	}

	const embla = EmblaCarousel(viewport, {
		align: 'center',
		containScroll: false,
		dragFree: false,
		loop: false,
	})

	root._emblaGallery = embla
	root.dataset.galleryReady = 'true'

	const updateControls = () => {
		const selectedIndex = embla.selectedScrollSnap()

		thumbs.forEach((thumb, index) => {
			const isActive = index === selectedIndex
			thumb.setAttribute('aria-current', isActive ? 'true' : 'false')
			if (isActive) {
				thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' })
			}
		})

		if (previousButton) previousButton.disabled = !embla.canScrollPrev()
		if (nextButton) nextButton.disabled = !embla.canScrollNext()
	}

	thumbs.forEach((thumb, index) => {
		thumb.addEventListener('click', () => embla.scrollTo(index))
	})

	previousButton?.addEventListener('click', () => embla.scrollPrev())
	nextButton?.addEventListener('click', () => embla.scrollNext())

	embla.on('select', updateControls)
	embla.on('reInit', updateControls)
	updateControls()
}

function initAllProductGalleries() {
	document
		.querySelectorAll<GalleryRoot>('[data-product-gallery]')
		.forEach(initProductGallery)
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initAllProductGalleries, { once: true })
} else {
	initAllProductGalleries()
}

document.addEventListener('astro:page-load', initAllProductGalleries)
