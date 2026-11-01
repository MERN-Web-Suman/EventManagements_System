/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff4ee',
          100: '#ffe6d3',
          200: '#ffcaa6',
          300: '#ffa570',
          400: '#ff7436',
          500: '#ff6b35',
          600: '#f04b0e',
          700: '#c73a0e',
          800: '#a03014',
          900: '#822a13',
        },
        dark: {
          900: '#0f0f1a',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#1f2951',
          500: '#253065',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(108,99,255,0.1))',
        'orange-gradient': 'linear-gradient(135deg, #ff6b35, #f7931e)',
        'purple-gradient': 'linear-gradient(135deg, #6c63ff, #3ecf8e)',
      },
    },
  },
  plugins: [],
};
