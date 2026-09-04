const spruce = {
  DEFAULT: '#1d2a24',
  hover: '#2c3f35',
}

const needle = {
  DEFAULT: '#c14a24',
  tint: '#f5e4dc',
}

const moss = {
  DEFAULT: '#dbe7d0',
  // Kept for pre-redesign components (Chip green tone, trap pass banner).
  tint: '#eaf2e3',
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f3ef',
        panel: '#e9e8e2',
        card: '#faf9f6',
        hairline: '#d6d4cc',
        ink: '#1c1e1a',
        muted: '#6d7069',
        // Deep spruce — primary accent and the painterly-card dark.
        spruce,
        // Needle orange — gauge needle, movement-down, PRODUCT chips, uncalibrated.
        needle,
        // Pale moss — pass states.
        moss,
        // Aliases kept so existing utility names resolve to the current palette.
        forest: spruce,
        rust: needle,
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        whisper: '0 1px 2px rgba(28, 30, 26, 0.04), 0 1px 1px rgba(28, 30, 26, 0.03)',
        lift: '0 2px 10px rgba(28, 30, 26, 0.07)',
      },
      transitionTimingFunction: {
        resolve: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
}
