/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A5C89E',
        'primary-dark': '#8FB388',
        'primary-light': '#BDD9B7',
        accent: '#FFFBB1',
        'accent-yellow': '#FFFBB1',
        secondary: '#D8E983',
        'secondary-green': '#AEB877',
        cream: '#FFFEF5',
        sage: '#A5C89E',
        lime: '#D8E983',
        olive: '#AEB877',
        'price': '#89986D',
      },
      borderRadius: {
        'card': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(165, 200, 158, 0.15)',
        'medium': '0 4px 20px rgba(165, 200, 158, 0.25)',
        'glow': '0 4px 24px rgba(165, 200, 158, 0.3)',
      }
    },
  },
  plugins: [],
}
