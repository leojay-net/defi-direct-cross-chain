import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'custom-gradient': '`linear-gradient(0deg, #0A0014, #0A0014), \\\\r\\\\n                            radial-gradient(47.25% 61.04% at 53.23% 100%, rgba(156, 44, 255, 0.2) 0%, rgba(10, 0, 19, 0.2) 100%)`'
  		},
  		fontSize: {
  			'title-xxl': [
  				'44px',
  				'55px'
  			],
  			'title-xl': [
  				'36px',
  				'45px'
  			],
  			'title-xl2': [
  				'33px',
  				'45px'
  			],
  			'title-lg': [
  				'28px',
  				'35px'
  			],
  			'title-md': [
  				'24px',
  				'30px'
  			],
  			'title-md2': [
  				'26px',
  				'30px'
  			],
  			'title-sm': [
  				'20px',
  				'26px'
  			],
  			'title-xsm': [
  				'18px',
  				'24px'
  			]
  		},
  		maxWidth: {
  			'3': '0.75rem',
  			'4': '1rem',
  			'11': '2.75rem',
  			'13': '3.25rem',
  			'14': '3.5rem',
  			'15': '3.75rem',
  			'25': '6.25rem',
  			'30': '7.5rem',
  			'34': '8.5rem',
  			'35': '8.75rem',
  			'40': '10rem',
  			'44': '11rem',
  			'45': '11.25rem',
  			'70': '17.5rem',
  			'90': '22.5rem',
  			'94': '23.5rem',
  			'125': '31.25rem',
  			'150': '37.5rem',
  			'180': '45rem',
  			'203': '50.75rem',
  			'230': '57.5rem',
  			'270': '67.5rem',
  			'280': '70rem',
  			'2.5': '0.625rem',
  			'22.5': '5.625rem',
  			'42.5': '10.625rem',
  			'132.5': '33.125rem',
  			'142.5': '35.625rem',
  			'242.5': '60.625rem',
  			'292.5': '73.125rem'
  		},
  		maxHeight: {
  			'35': '8.75rem',
  			'70': '17.5rem',
  			'90': '22.5rem',
  			'300': '18.75rem',
  			'550': '34.375rem'
  		},
  		minWidth: {
  			'75': '18.75rem',
  			'22.5': '5.625rem',
  			'42.5': '10.625rem',
  			'47.5': '11.875rem'
  		},
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secomondary: '#0A0014',
  			'col-text': '#9747FFB2',
  			'col-white': '#ffffff',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
