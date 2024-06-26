/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'color-dark': '#272727',
      'blue': '#050505',
      'white': '#ffffff',
      'yellow': '#FDCF76',
      'yellow-60': 'rgba(255, 255, 255, 0.1)'
    },
  },

  plugins: [],
}