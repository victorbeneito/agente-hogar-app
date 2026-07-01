import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#6BAEC9',
        secondary: '#6A6A6A',
        terciari:  '#DDC9A3',
        accent:    '#F7A36B',
        fondo:     '#F8F8F5',
        hover:     '#AED7E6',
        negro:     '#1A1A1A',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        orienta: ['Orienta', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config