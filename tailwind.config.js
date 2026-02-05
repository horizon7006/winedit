/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#000000', // Pitch black
                panel: '#1a1a1a', // Dark gray
                surface: '#2d2d2d', // Medium gray
                border: '#4a4a4a', // Light gray
                accent: {
                    DEFAULT: '#00aa00', // Retro Terminal Green
                    hover: '#00cc00',
                },
                text: {
                    primary: '#e0e0e0', // Off-white
                    secondary: '#a0a0a0', // Silver
                    muted: '#606060', // Dim gray
                }
            },
            fontFamily: {
                sans: ['"JetBrains Mono"', 'monospace'], // Force Mono everywhere for retro feel
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                'full': '9999px', // Keep full for circles
            }
        },
    },
    plugins: [],
}
