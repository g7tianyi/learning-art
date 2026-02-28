import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Wabi-sabi color palette
        background: {
          light: '#FEFEFE',
          dark: '#1A1A1A',
        },
        foreground: {
          light: '#2C2C2C',
          dark: '#E8E8E8',
        },
        accent: {
          ochre: '#D4A574',
          sage: '#A8B5A1',
          rose: '#C9A9A6',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
