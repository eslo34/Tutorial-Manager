/** @type {import('tailwindcss').Config} */
// StepByStep brand palette (dark-first).
// The app is styled with raw Tailwind utility classes, so the theme is tuned
// so those existing classes render the brand correctly on a dark ground:
//   - gray  = a cool blue-ink scale, INVERTED (gray-50 = near-black ground,
//             gray-900 = warm off-white text) so bg-*/text-* pairings flip together.
//   - primary = the brand "sync" green (buttons use bright green + dark ink).
//   - blue/green/yellow/amber/orange/red = "barbell" scales: low shades (50-200)
//             are dark tint fills, high shades (700-900) are bright legible text,
//             600 stays a vivid solid for buttons.
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand surface + accent tokens (dark theme)
        ground: '#0A0C10',
        raised: '#12151B',
        inset: '#0B0D12',
        line: 'rgba(151,164,190,0.14)',
        ink: '#04140B',      // dark text used on the green primary buttons
        sync: '#5FE38C',
        render: '#F5B44C',
        stale: '#FF6B6B',

        // primary = brand "sync" green
        primary: {
          50: '#0F251A',
          100: '#123024',
          200: '#1C4A34',
          300: '#2E7D50',
          400: '#48C77D',
          500: '#5FE38C',
          600: '#5FE38C',
          700: '#4BD07B',
          800: '#9EF0BC',
          900: '#04140B',
        },

        // Cool blue-ink neutrals, inverted for dark
        gray: {
          50: '#0E1116',
          100: '#171B22',
          200: '#232833',
          300: '#2E343F',
          400: '#6C7280',
          500: '#8B909B',
          600: '#A7ACB7',
          700: '#C4C8D0',
          800: '#DEE0DC',
          900: '#ECEDE7',
        },

        // AI / info actions
        blue: {
          50: '#12213A',
          100: '#172C4D',
          200: '#1E3A63',
          300: '#2F5490',
          400: '#5B8DEF',
          500: '#3B82F6',
          600: '#3B82F6',
          700: '#60A5FA',
          800: '#93C5FD',
          900: '#BFDBFE',
        },

        // Success / accepted / synced
        green: {
          50: '#0E2A1C',
          100: '#123726',
          200: '#1B4D33',
          300: '#2E7D50',
          400: '#5FE38C',
          500: '#34D07A',
          600: '#16A34A',
          700: '#22C55E',
          800: '#86EFAC',
          900: '#BBF7D0',
        },

        // Warnings / awaiting recording
        yellow: {
          50: '#2A2410',
          100: '#3A3214',
          200: '#4D4218',
          300: '#7A6A2A',
          400: '#D9B84A',
          500: '#F5B44C',
          600: '#F5B44C',
          700: '#F0C674',
          800: '#F5D98A',
          900: '#FAE7B0',
        },

        amber: {
          50: '#2A2410',
          100: '#3A3214',
          200: '#4D4218',
          300: '#7A6A2A',
          400: '#D9B84A',
          500: '#F5B44C',
          600: '#F5B44C',
          700: '#F0C674',
          800: '#F5D98A',
          900: '#FAE7B0',
        },

        // Pending badges
        orange: {
          50: '#2E2113',
          100: '#3E2C15',
          200: '#5A3F1C',
          300: '#7A5526',
          400: '#D98A3A',
          500: '#F59E3C',
          600: '#F5A94C',
          700: '#F7B968',
          800: '#F8CE92',
          900: '#FADFB8',
        },

        // Danger / error / outdated / stale
        red: {
          50: '#2E1517',
          100: '#3E1A1D',
          200: '#552024',
          300: '#8A3238',
          400: '#FF6B6B',
          500: '#F87171',
          600: '#EF4444',
          700: '#F87171',
          800: '#FCA5A5',
          900: '#FECACA',
        },

        // Old primary hue — remap the one place it's used (status "active") to green
        teal: {
          600: '#5FE38C',
          700: '#4BD07B',
        },
      },
    },
  },
  plugins: [],
}
