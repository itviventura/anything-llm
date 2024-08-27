/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "false",
  content: {
    relative: true,
    files: [
      "./src/components/**/*.{js,jsx}",
      "./src/hooks/**/*.js",
      "./src/models/**/*.js",
      "./src/pages/**/*.{js,jsx}",
      "./src/utils/**/*.js",
      "./src/*.jsx",
      "./index.html",
      "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
    ]
  },
  theme: {
    extend: {
      rotate: {
        270: "270deg",
        360: "360deg"
      },
      colors: {
        "black-900": "#FFFFFF",
        accent: "#F0F4F8",
        "sidebar-button": "#E5E7EB",
        sidebar: "#F9FAFB",
        "historical-msg-system": "rgba(0, 0, 0, 0.02);",
        "historical-msg-user": "rgb(97 174 252 / 0.25)",
        outline: "#D1D5DB",
        "primary-button": "#61aefc",
        secondary: "#61adfccc",
        "dark-input": "#FFFFFF",
        "mobile-onboarding": "#E5E7EB",
        "dark-highlight": "#7ab2ea",
        "dark-text": "#374151",
        description: "#6B7280",
        "x-button": "#9CA3AF",
        royalblue: "#065986",
        purple: "#4A1FB8",
        magenta: "#9E165F",
        danger: "#F04438",
        error: "#B42318",
        warn: "#854708",
        success: "#05603A",
        darker: "#F4F4F4"
      },
      backgroundImage: {
        "preference-gradient":
          "linear-gradient(180deg, #E5E7EB 0%, rgba(229, 231, 235, 0.28) 100%);",
        "chat-msg-user-gradient":
          "linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);",
        "selected-preference-gradient":
          "linear-gradient(180deg, #E5E7EB 0%, rgba(243, 244, 246, 0) 100%);",
        "main-gradient": "linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%)",
        "modal-gradient": "linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%)",
        "sidebar-gradient": "linear-gradient(90deg, #F9FAFB 0%, #E5E7EB 100%)",
        "login-gradient": "linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%)",
        "menu-item-gradient":
          "linear-gradient(90deg, #F9FAFB 0%, #E5E7EB 100%)",
        "menu-item-selected-gradient":
          "linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 100%)",
        "workspace-item-gradient":
          "linear-gradient(90deg, #F9FAFB 0%, #E5E7EB 100%)",
        "workspace-item-selected-gradient":
          "linear-gradient(90deg, #4fc3f726 0%, #4fc3f726 100%)",
        "switch-selected": "linear-gradient(146deg, #E5E7EB 0%, #F3F4F6 100%)"
      },
      fontFamily: {
        sans: [
          "Source Sans Pro",
          "Helvetica",
          "plus-jakarta-sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      },
      animation: {
        sweep: "sweep 0.5s ease-in-out",
        "pulse-glow": "pulse-glow 1.5s infinite"
      },
      keyframes: {
        sweep: {
          "0%": { transform: "scaleX(0)", transformOrigin: "bottom left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "bottom left" }
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 }
        },
        "pulse-glow": {
          "0%": {
            opacity: 1,
            transform: "scale(1)",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0.0)",
            backgroundColor: "rgba(0, 0, 0, 0.0)"
          },
          "50%": {
            opacity: 1,
            transform: "scale(1.1)",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
            backgroundColor: "rgba(0, 0, 0, 0.1)"
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0.0)",
            backgroundColor: "rgba(0, 0, 0, 0.0)"
          }
        }
      }
    }
  },
  // Required for rechart styles to show since they can be rendered dynamically and will be tree-shaken if not safe-listed.
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    }
  ],
  plugins: []
}
