/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        playerX: {
          light: '#3b82f6', // blue-500
          DEFAULT: '#2563eb', // blue-600
          dark: '#1d4ed8', // blue-700
          glow: 'rgba(59, 130, 246, 0.4)'
        },
        playerO: {
          light: '#ef4444', // red-500
          DEFAULT: '#dc2626', // red-600
          dark: '#b91c1c', // red-700
          glow: 'rgba(239, 68, 68, 0.4)'
        },
        activeBoard: {
          light: '#e0e7ff', // indigo-100
          DEFAULT: '#6366f1', // indigo-500
          dark: '#312e81', // indigo-900
        }
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s infinite',
        'pop-in': 'popIn 0.25s ease-out forwards',
        'glow-pulse': 'glowPulse 1.8s ease-in-out infinite'
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '80%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)' },
          '50%': { boxShadow: '0 0 24px rgba(99, 102, 241, 0.95)' }
        }
      }
    },
  },
  plugins: [],
}
