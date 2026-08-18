/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asfalto: {
          950: '#0a0b0d',
          900: '#111317',
          800: '#1a1d23',
          700: '#262a32',
          600: '#3a3f4a'
        },
        racing: {
          DEFAULT: '#ff3b30',   // vermelho racing (acento primário)
          dark: '#c9291f',
          light: '#ff6b5f'
        },
        checkered: '#f5f5f0',   // branco quente (bandeira quadriculada)
        ouro: '#d4af37',        // 1º lugar
        prata: '#c0c0c8',       // 2º lugar
        bronze: '#cd7f32'       // 3º lugar
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],   // títulos, números, pódio — pegada motorsport
        body: ['"Inter"', 'sans-serif']
      },
      backgroundImage: {
        'flag-pattern': "repeating-conic-gradient(#1a1d23 0% 25%, #262a32 0% 50%)"
      }
    }
  },
  plugins: []
};
