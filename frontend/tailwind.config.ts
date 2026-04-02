import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Isek.AI — tema anime escuro
        void: {
          950: '#05030f',
          900: '#0a0618',
          800: '#110d2a',
          700: '#1a1240',
        },
        mana: {
          50:  '#f0e8ff',
          100: '#ddd0ff',
          200: '#c4a8ff',
          300: '#a87cff',
          400: '#8b4fff',
          500: '#7c3aed', // primary purple
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1479',
        },
        neon: {
          blue:   '#00d4ff',
          purple: '#bf00ff',
          gold:   '#ffd700',
          green:  '#00ff88',
        },
        aura: {
          light: 'rgba(124,58,237,0.15)',
          mid:   'rgba(124,58,237,0.30)',
          glow:  'rgba(124,58,237,0.60)',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        mono:    ['var(--font-jetbrains)', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'void-gradient':   'linear-gradient(135deg, #05030f 0%, #110d2a 50%, #0a0618 100%)',
        'mana-gradient':   'linear-gradient(135deg, #7c3aed 0%, #00d4ff 100%)',
        'gold-gradient':   'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(17,13,42,0.9) 0%, rgba(26,18,64,0.9) 100%)',
      },
      boxShadow: {
        'mana-sm':  '0 0 8px rgba(124,58,237,0.4)',
        'mana-md':  '0 0 20px rgba(124,58,237,0.5)',
        'mana-lg':  '0 0 40px rgba(124,58,237,0.6)',
        'neon-blue':'0 0 20px rgba(0,212,255,0.5)',
        'neon-gold':'0 0 20px rgba(255,215,0,0.5)',
      },
      animation: {
        'pulse-mana':  'pulse-mana 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-mana': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124,58,237,0.4)' },
          '50%':       { boxShadow: '0 0 30px rgba(124,58,237,0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
