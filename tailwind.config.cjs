/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}' ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [ 'Inter', 'system-ui', 'sans-serif' ],
        heading: [ 'Geist', 'Geist Sans', 'system-ui', 'sans-serif' ],
      },
    },
  },
  plugins: [
    require( '@tailwindcss/typography' ),
    require( 'tailwindcss-aria-attributes' ),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
