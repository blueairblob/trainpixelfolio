
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1A237E', // Dark Blue
        secondary: '#D32F2F', // Red for navbar
        background: '#FFFFFF', // White background
        border: 'rgb(var(--border) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
