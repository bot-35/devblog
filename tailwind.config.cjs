/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
                jost: 'Jost Variable, Times New Roman, serif',
				rozha: 'Rozha One, sans-serif '
            },
		
			colors: {
				'blog': {
					'black': '#0e0e0e',
					'marron-text': '#dd9429',
					'marron-shadow': '#c0882e',
					'marron-fond': '#e8b870',
					'marron-reflet': '#e1c9a7'
				}
		  	}
		},
	  },
	plugins: [],
}
