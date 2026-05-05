## Velarshop UI / UX rules

Main principle: a Velar model page is not a decorative card-based landing page. It must be a calm premium product page: whitespace, careful typography, readable tables, preserved SEO text, clear CTAs, and internal linking.

### Typography

- Do not use arbitrary font sizes like `15px`, `17px`, `19px`.
- Prefer project typography scale through existing CSS variables, Tailwind classes, or shared utility classes.
- Body text should be visually calm and readable:
  - desktop: usually 14px or 16px depending on existing project scale;
  - mobile: avoid oversized text, especially in product pages.
- Avoid making most text bold.
- Use `font-weight: 400` for regular paragraphs.
- Use `font-weight: 500` only for short labels, table keys, small accents.
- Use `font-weight: 600` for section headings.
- Use `font-weight: 700` only for H1/H2 or rare strong accents.
- Product pages should not look visually heavy.

### Spacing

- Add enough vertical whitespace between major sections.
- Do not create cramped blocks.
- Prefer consistent section spacing:
  - desktop: 56-80px between large sections;
  - mobile: 36-48px between large sections.
- Inside sections, keep compact but readable spacing.

### Cards

- Do not wrap everything into cards.
- Do not create "card inside card" layouts unless there is a clear functional reason.
- Product pages should use:
  - clean sections;
  - tables;
  - lists;
  - simple rows;
  - minimal containers.
- Cards are allowed only for actual product cards, related products, compact model previews, or CTA blocks.
- Characteristics, descriptions, FAQ, delivery, and process blocks should not look like nested cards.

### Product descriptions

- Never shorten existing SEO/product descriptions without explicit instruction.
- Preserve useful original text, internal links, model mentions, and commercial meaning.
- If rewriting text, keep the full semantic volume.
- Do not replace detailed model descriptions with generic short copy.
- If there is an original link to a related model, preserve it.

### Product characteristics

- Characteristics should be informative and easy to scan.
- Prefer a clean table or definition-list layout.
- Avoid heavy bordered cards for each characteristic.
- Avoid duplicated information if the same data already appears nearby.
- On mobile, characteristics should stay compact and readable.

### Mobile product pages

- Do not let the image/gallery take the whole first two screens.
- On mobile, the top of the page should show:
  - product title;
  - short useful description;
  - price / status;
  - main CTA;
  - then image/gallery.
- Gallery should be compact on mobile.
- Avoid huge thumbnails and oversized image blocks.

### CTA buttons

- Button labels must match the action.
- If a button scrolls to sizes/models, name it "Смотреть размеры" or similar.
- If a button opens a request form, name it "Получить расчет".
- Do not confuse the user with multiple similar CTAs in one place.

### Text links

- Text links inside product descriptions, article prose, and MDX content must not use raw browser-default underline styles.
- Links should be visible but calm:
  - brand red color;
  - thin underline;
  - small underline offset;
  - hover state must visibly change the underline or remove it.
- Do not apply text-link styles to buttons, navigation links, breadcrumbs, footer links, or card actions.
- Always preserve internal links when rewriting product descriptions or article content.

### SEO / content preservation

- Before refactoring any category/model page, compare with the previous version and make sure:
  - no useful text was deleted;
  - no internal links disappeared;
  - no FAQ items disappeared unless intentionally replaced;
  - no SEO headings were weakened;
  - no Schema.org data was removed.
