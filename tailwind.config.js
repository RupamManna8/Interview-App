// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#4F46E5',
          700: '#7C3AED',
        },
        accent: '#0891B2',
        success: '#16A34A',
        error: '#DC2626',
        cream: {
          DEFAULT: '#F8F5F0',
          dark: '#F1ECE6',
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'xl': '1rem',
        'lg': '0.75rem',
      }
    },
  },
  plugins: [],
}