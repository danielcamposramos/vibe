/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {
			transitionProperty: {
				height: 'height',
			},
		},
	},
        plugins: [daisyui],
	daisyui: {
		themes: [
			{
				dark: {
					'color-scheme': 'dark',
					primary: '#1565c0',
					'primary-content': '#fff',
					secondary: '#7b1fa2',
					'secondary-content': '#fff',
					accent: '#1F262E',
					'accent-content': '#fff',
					neutral: '#556474',
					'neutral-content': '#B0B8C4',
					'base-100': '#111419',
					'base-200': '#1E272E',
					'base-300': '#1F272A',
					'base-content': '#ffffff',
					info: '#01579b',
					'info-content': '#ffffff',
					success: '#1b5e20',
					'success-content': '#ffffff',
					warning: '#e65100',
					'warning-content': '#ffffff',
					error: '#c62828',
					'error-content': '#ffffff',
				},
				light: {
					'color-scheme': 'light',
					primary: '#2A8DF1',
					'primary-content': '#D9E9F8',
					secondary: '#7b1fa2',
					'secondary-content': '#D9E9F8',
					accent: '#0B6BCB',
					'accent-content': '#D9E9F8',
					neutral: '#303740',
					'neutral-content': '#FFFFFF',
					'base-100': '#FEFEFF',
					'base-200': '#F5FAFF',
					'base-300': '#E5F6FD',
					'base-content': '#111419',
					info: '#03a9f4',
					'info-content': '#ffffff',
					success: '#4caf50',
					'success-content': '#ffffff',
					warning: '#ff9800',
					'warning-content': '#ffffff',
					error: '#ef5350',
					'error-content': '#ffffff',
				},
			},
		],
	},
}
