/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#080C14',
          surface: '#0F172A',
          card: '#151F32',
          border: '#1E293B',
          cyan: '#06B6D4',
          cyanGlow: '#22D3EE',
          violet: '#8B5CF6',
          violetGlow: '#A78BFA',
          accent: '#38BDF8'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-subtle': 'bounce 2s infinite'
      }
    },
  },
  plugins: [],
}
