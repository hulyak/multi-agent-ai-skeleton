import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Enhanced spooky theme colors with WCAG AA contrast
        spooky: {
          'bg-primary': '#0a0a0a',      // Pure dark black
          'bg-secondary': '#1a1a1a',    // Slightly lighter black
          'bg-tertiary': '#2a2a2a',     // Medium dark gray
          'accent-orange': '#ff8c42',   // Brighter pumpkin orange (better contrast)
          'accent-purple': '#9c4dcc',   // Lighter purple (better contrast)
          'accent-green': '#66bb6a',    // Brighter green (better contrast)
          'neon-accent': '#d4e157',     // Brighter neon yellow-green (better contrast)
          'text-primary': '#ffffff',    // Pure white for maximum contrast
          'text-secondary': '#e0e0e0',  // Very light gray (better contrast)
          'text-muted': '#b0b0b0',      // Medium gray (better contrast)
          'border-subtle': '#3a3a3a',   // Visible dark border
          'border-accent': '#5a5a5a',   // More visible border
        },
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'tighter': '-0.04em',
        'tight': '-0.02em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.04em',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(106, 27, 154, 0.5), 0 0 10px rgba(106, 27, 154, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(106, 27, 154, 0.8), 0 0 30px rgba(106, 27, 154, 0.5)',
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '41%': { opacity: '1' },
          '42%': { opacity: '0.8' },
          '43%': { opacity: '1' },
          '45%': { opacity: '0.9' },
          '46%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(5deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-5deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 2px rgba(171, 188, 4, 0.5))',
          },
          '50%': { 
            filter: 'drop-shadow(0 0 8px rgba(171, 188, 4, 0.8))',
          },
        },
      },
      backgroundImage: {
        'bone-texture': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M10 50 Q 30 30, 50 50 T 90 50\" stroke=\"%23ffffff\" stroke-width=\"2\" fill=\"none\" opacity=\"0.03\"/%3E%3C/svg%3E')",
        'ribcage': "url('data:image/svg+xml,%3Csvg width=\"200\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg opacity=\"0.02\" stroke=\"%23ffffff\" fill=\"none\"%3E%3Cellipse cx=\"100\" cy=\"100\" rx=\"60\" ry=\"80\"/%3E%3Cpath d=\"M 60 60 Q 100 70, 140 60\"/%3E%3Cpath d=\"M 60 80 Q 100 90, 140 80\"/%3E%3Cpath d=\"M 60 100 Q 100 110, 140 100\"/%3E%3Cpath d=\"M 60 120 Q 100 130, 140 120\"/%3E%3C/g%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
};
export default config;
