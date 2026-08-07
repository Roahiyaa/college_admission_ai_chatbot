module.exports = {
  content: [
    "./static/**/*.html",
    "./static/**/*.js",
    "./backend/**/*.py"
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  '#FFF5F5',
          100: '#FFE3E3',
          200: '#FFBDBD',
          300: '#FF9B9B',
          400: '#F86868',
          500: '#E53E3E',
          600: '#C0392B',
          700: '#9B2335',
          800: '#7A1A1A',
          900: '#5C0F0F',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#92680A',
          800: '#6B4F08',
          900: '#4A3706',
        },
        amrita: {
          navy: '#1A1A2E',
          cream: '#FDF8F3',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
