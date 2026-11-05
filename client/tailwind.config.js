/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0907',
          secondary: '#12100C',
        },
        surface: {
          DEFAULT: '#12100C',
          card: '#14120E',
          hover: '#1B1712',
          border: '#3D3321',
          muted: '#181510',
        },
        gold: {
          DEFAULT: '#D4AF57',
          bright: '#E8C97B',
          champagne: '#F3E5AB',
          muted: '#A88D52',
          dark: '#7A6432',
          border: '#4A3D24',
          subtle: 'rgba(212, 175, 87, 0.12)',
        },
        typography: {
          primary: '#F5F0E6',
          secondary: '#A69D8B',
          muted: '#706859',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        oswald: ['Oswald', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.6)',
        'gold-card': '0 8px 30px -10px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 87, 0.08)',
        'gold-hover': '0 12px 35px -8px rgba(0, 0, 0, 0.9), 0 0 25px rgba(212, 175, 87, 0.18)',
      },
    },
  },
  plugins: [],
}
