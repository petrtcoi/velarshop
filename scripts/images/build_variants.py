#!/usr/bin/env python3
"""
Build web-sized originals + AVIF/WebP width variants for site images.

Usage (from the project root, after adding or replacing photos):

    python3 scripts/images/build_variants.py            # process everything that changed
    python3 scripts/images/build_variants.py --dry-run  # only list what would be done
    python3 scripts/images/build_variants.py --force    # rebuild all variants

What it does for every source image under public/images (+ the few extra
files listed in EXTRA_FILES), except the paths in EXCLUDE:

1. Fallback original (same path, never renamed: paths are referenced in data/MDX):
   - JPEG: longest side <= 1600 px (never upscale), metadata stripped,
     quality 80, progressive, 4:2:0.  Replaced only if the result is smaller
     or the image had to be downscaled.
   - PNG: resized to <= 1600 px and re-saved with -strip and
     png:compression-level=9 (alpha kept).  Replaced only if smaller/resized.
   - WebP / AVIF originals: re-encoded only when larger than 1600 px.
   A file is optimised once: its sha1 is recorded in processed-state.json
   next to this script, so re-runs never recompress the same file again.
2. Variants next to the original: <name>-640.avif/.webp and <name>-1200.avif/.webp.
   Widths larger than or equal to the original are not generated; instead the
   largest variant is the original width (e.g. <name>-900.avif for a 900 px image).
   AVIF: avifenc -q 60 -s 6 -y 420 (alpha kept); WebP: cwebp -q 78 (alpha kept).
   Variants newer than their source are skipped.
3. src/lib/imageManifest.json: { "/images/x/1.jpg": {"w":..,"h":..,"variants":[640,1200],"alpha":false} }
   w/h are of the optimised original.  "variants" is empty when no variants
   exist (e.g. two different sources share a file stem: 1.jpg + 1.webp).

Components (src/7-shared/components/ResponsiveImage.astro, Picture.astro) read the
manifest and render <picture> AVIF -> WebP -> original.  Images not in the
manifest are rendered as a plain <img>.

Requires: ImageMagick 7 (`magick`), `avifenc`, `cwebp`, Python 3.9+.
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
MANIFEST = ROOT / 'src' / 'lib' / 'imageManifest.json'
STATE = Path(__file__).resolve().parent / 'processed-state.json'

SCAN_DIRS = ['images']
# Extra images that are shown on pages via <img>/<Picture> outside public/images.
EXTRA_FILES = [
	'certificates/cert1.jpeg',
	'certificates/cert2.jpeg',
	'certificates/cert3.jpeg',
	'docs/cert.jpg',
]
# Paths relative to public/ (fnmatch patterns).  Hand-made hero/popular sets,
# logos and icons are left untouched.
EXCLUDE = [
	'images/main/hero/*',
	'images/main/popular/*',
	'images/columns/hero/*',
	'images/retro/hero/*',
	'images/design/hero/q40v-black-interior-*',
	'images/convector/hero/panoramic-floor-convector-*',
	'images/logo*.png',
	'images/social-icons/*',
]
# Certificates are opened full size from a link: keep them readable.
MAX_SIDE_OVERRIDES = {
	'certificates/*': 2000,
}

SOURCE_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
RASTER_EXT = {'.jpg', '.jpeg', '.png'}
MAX_SIDE = 1600
TARGET_WIDTHS = (640, 1200)
JPEG_QUALITY = 80
AVIF_ARGS = ['-q', '60', '-s', '6', '-j', '2']
WEBP_QUALITY = '78'
VARIANT_RE = re.compile(r'^(?P<base>.+)-(?P<w>\d{2,4})\.(avif|webp)$', re.I)


def run(cmd: list[str]) -> str:
	res = subprocess.run(cmd, capture_output=True, text=True)
	if res.returncode != 0:
		raise RuntimeError(f'{" ".join(cmd)}\n{res.stderr.strip()}')
	return res.stdout


def identify(path: Path) -> tuple[int, int, bool]:
	out = run(['magick', 'identify', '-format', '%w %h %[opaque]\n', str(path)]).split('\n')[0].split()
	return int(out[0]), int(out[1]), out[2].lower() == 'false'


def sha1(path: Path) -> str:
	return hashlib.sha1(path.read_bytes()).hexdigest()


def rel(path: Path) -> str:
	return path.relative_to(PUBLIC).as_posix()


def is_excluded(relpath: str) -> bool:
	return any(fnmatch.fnmatch(relpath, pattern) for pattern in EXCLUDE)


def max_side_for(relpath: str) -> int:
	for pattern, value in MAX_SIDE_OVERRIDES.items():
		if fnmatch.fnmatch(relpath, pattern):
			return value
	return MAX_SIDE


def discover() -> list[Path]:
	candidates: list[Path] = []
	for d in SCAN_DIRS:
		for p in sorted((PUBLIC / d).rglob('*')):
			if p.is_file() and p.suffix.lower() in SOURCE_EXT:
				candidates.append(p)
	for f in EXTRA_FILES:
		p = PUBLIC / f
		if p.is_file():
			candidates.append(p)

	stems = {(p.parent, p.stem) for p in candidates}
	sources = []
	for p in candidates:
		if is_excluded(rel(p)):
			continue
		m = VARIANT_RE.match(p.name)
		if m and (p.parent, m.group('base')) in stems:
			continue  # generated variant
		sources.append(p)
	return sources


def variant_widths(width: int) -> list[int]:
	widths = [w for w in TARGET_WIDTHS if w < width]
	if width <= TARGET_WIDTHS[-1]:
		widths.append(width)
	return widths


def optimise_original(src: Path, state: dict, dry: bool) -> tuple[int, int]:
	"""Recompress the fallback original in place.  Returns (bytes_before, bytes_after)."""
	key = rel(src)
	before = src.stat().st_size
	digest = sha1(src)
	if state.get(key) == digest:
		return before, before

	w, h, alpha = identify(src)
	limit = max_side_for(key)
	needs_resize = max(w, h) > limit
	ext = src.suffix.lower()
	if dry:
		print(f'  would optimise {key} ({w}x{h}, {before} B)')
		return before, before

	with tempfile.TemporaryDirectory() as tmp:
		out = Path(tmp) / f'out{ext}'
		resize = ['-resize', f'{limit}x{limit}>']
		if ext in ('.jpg', '.jpeg'):
			run(['magick', str(src), '-auto-orient', *resize, '-strip',
				'-sampling-factor', '4:2:0', '-interlace', 'Plane', '-quality', str(JPEG_QUALITY), str(out)])
		elif ext == '.png':
			run(['magick', str(src), '-auto-orient', *resize, '-strip',
				'-define', 'png:compression-level=9', '-define', 'png:compression-filter=5', str(out)])
		elif needs_resize:
			png = Path(tmp) / 'resized.png'
			run(['magick', str(src), *resize, '-strip', f'PNG{"32" if alpha else "24"}:{png}'])
			if ext == '.webp':
				run(['cwebp', '-quiet', '-q', WEBP_QUALITY, '-metadata', 'none', str(png), '-o', str(out)])
			else:
				run(['avifenc', *AVIF_ARGS, '-y', '420', str(png), str(out)])
		else:
			state[key] = digest
			return before, before

		after = out.stat().st_size
		if needs_resize or after < before:
			shutil.copyfile(out, src)
		else:
			after = before
	state[key] = sha1(src)
	return before, after


def build_variants(src: Path, force: bool, dry: bool, primary: bool) -> dict:
	w, h, alpha = identify(src)
	entry = {'w': w, 'h': h, 'variants': [], 'alpha': alpha}
	if not primary:
		return entry
	src_mtime = src.stat().st_mtime
	widths = variant_widths(w)
	jobs = []
	for vw in widths:
		for fmt in ('avif', 'webp'):
			out = src.with_name(f'{src.stem}-{vw}.{fmt}')
			if not force and out.exists() and out.stat().st_mtime >= src_mtime:
				continue
			jobs.append((vw, fmt, out))
	entry['variants'] = widths
	if dry:
		for vw, fmt, out in jobs:
			print(f'  would write {rel(out)}')
		return entry
	if not jobs:
		return entry

	with tempfile.TemporaryDirectory() as tmp:
		pngs: dict[int, Path] = {}
		for vw, fmt, out in jobs:
			if vw not in pngs:
				png = Path(tmp) / f'{vw}.png'
				resize = [] if vw == w else ['-resize', f'{vw}x']
				run(['magick', str(src), '-auto-orient', *resize, '-strip', '-colorspace', 'sRGB',
					'-depth', '8', f'PNG{"32" if alpha else "24"}:{png}'])
				pngs[vw] = png
			png = pngs[vw]
			if fmt == 'avif':
				run(['avifenc', *AVIF_ARGS, '-y', '420', str(png), str(out)])
			else:
				cmd = ['cwebp', '-quiet', '-q', WEBP_QUALITY, '-metadata', 'none']
				if alpha:
					cmd += ['-alpha_q', '90', '-exact']
				run(cmd + [str(png), '-o', str(out)])
	return entry


def main() -> int:
	parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	parser.add_argument('--dry-run', action='store_true')
	parser.add_argument('--force', action='store_true', help='rebuild variants even if they are up to date')
	parser.add_argument('--workers', type=int, default=max(2, (os.cpu_count() or 4) // 2))
	args = parser.parse_args()

	for tool in ('magick', 'avifenc', 'cwebp'):
		if not shutil.which(tool):
			print(f'missing tool: {tool}', file=sys.stderr)
			return 1

	state = json.loads(STATE.read_text()) if STATE.exists() else {}
	sources = discover()

	# Two different sources with the same stem in one folder (1.jpg + 1.webp) would
	# write the same variant names: only the raster one gets variants.
	by_stem: dict[tuple[Path, str], list[Path]] = {}
	for p in sources:
		by_stem.setdefault((p.parent, p.stem), []).append(p)
	primary: set[Path] = set()
	for group in by_stem.values():
		group.sort(key=lambda p: (p.suffix.lower() not in RASTER_EXT, p.name))
		primary.add(group[0])
		for other in group[1:]:
			print(f'note: {rel(other)} shares a stem with {rel(group[0])}; no variants for it')

	def process(src: Path):
		before, after = optimise_original(src, state, args.dry_run)
		entry = build_variants(src, args.force, args.dry_run, src in primary)
		return src, before, after, entry

	results = []
	with ThreadPoolExecutor(max_workers=args.workers) as pool:
		for i, res in enumerate(pool.map(process, sources), 1):
			results.append(res)
			if i % 25 == 0:
				print(f'{i}/{len(sources)}')

	total_before = sum(r[1] for r in results)
	total_after = sum(r[2] for r in results)
	manifest = {}
	variant_files = 0
	grew = []
	for src, before, after, entry in sorted(results, key=lambda r: rel(r[0])):
		manifest['/' + rel(src)] = entry
		variant_files += 2 * len(entry['variants'])
		if after > before:
			grew.append(rel(src))

	if not args.dry_run:
		lines = ',\n'.join(
			f'{json.dumps(k, ensure_ascii=False)}:{json.dumps(v, separators=(",", ":"))}'
			for k, v in manifest.items()
		)
		MANIFEST.write_text('{\n' + lines + '\n}\n')
		STATE.write_text(json.dumps(dict(sorted(state.items())), indent=0) + '\n')

	images_dir = PUBLIC / 'images'
	print(f'sources: {len(results)}')
	print(f'originals: {total_before / 1e6:.2f} MB -> {total_after / 1e6:.2f} MB')
	print(f'variant files referenced in manifest: {variant_files}')
	print(f'public/images total now: {sum(p.stat().st_size for p in images_dir.rglob("*") if p.is_file()) / 1e6:.2f} MB')
	if not args.dry_run:
		print(f'manifest: {MANIFEST.relative_to(ROOT)} ({MANIFEST.stat().st_size} B)')
	if grew:
		print('grew:', *grew, sep='\n  ')
	return 0


if __name__ == '__main__':
	sys.exit(main())
