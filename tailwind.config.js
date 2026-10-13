module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
        ui: {
          fg: {
            base: "var(--fg-base)",
            subtle: "var(--fg-subtle)",
            muted: "var(--fg-muted)",
            interactive: {
              DEFAULT: "var(--fg-interactive)",
              hover: "var(--fg-interactive-hover)",
            },
            "on-inverted": "var(--fg-on-inverted)",
          },
          bg: {
            base: "var(--bg-base)",
            subtle: "var(--bg-subtle)",
            interactive: "var(--bg-interactive)",
            disabled: "var(--bg-disabled)",
            component: {
              DEFAULT: "var(--bg-component)",
              hover: "var(--bg-component-hover)",
            },
            field: {
              DEFAULT: "var(--bg-field)",
              hover: "var(--bg-field-hover)",
            },
          },
          border: {
            base: "var(--border-base)",
            strong: "var(--border-strong)",
            interactive: "var(--border-interactive)",
            danger: "var(--border-danger)",
          },
          button: {
            inverted: {
              DEFAULT: "var(--button-inverted)",
              hover: "var(--button-inverted-hover)",
            },
            transparent: {
              DEFAULT: "var(--button-transparent)",
              hover: "var(--button-transparent-hover)",
            },
            danger: {
              DEFAULT: "var(--button-danger)",
              hover: "var(--button-danger-hover)",
            },
          },
          tag: {
            neutral: {
              bg: "var(--tag-neutral-bg)",
              text: "var(--tag-neutral-text)",
              border: "var(--tag-neutral-border)",
            },
            green: {
              bg: "var(--tag-green-bg)",
              text: "var(--tag-green-text)",
              border: "var(--tag-green-border)",
            },
            red: {
              bg: "var(--tag-red-bg)",
              text: "var(--tag-red-text)",
              border: "var(--tag-red-border)",
            },
            blue: {
              bg: "var(--tag-blue-bg)",
              text: "var(--tag-blue-text)",
              border: "var(--tag-blue-border)",
            },
            orange: {
              bg: "var(--tag-orange-bg)",
              text: "var(--tag-orange-text)",
              border: "var(--tag-orange-border)",
            },
          },
        },
      },
      boxShadow: {
        "borders-base": "0 0 0 1px var(--border-base)",
        "borders-interactive": "0 0 0 1px var(--border-interactive)",
        "borders-interactive-with-active":
          "0 0 0 1px var(--border-interactive)",
        "borders-interactive-with-focus": "0 0 0 1px var(--border-interactive)",
        "borders-strong-with-shadow": "0 0 0 1px var(--border-strong)",
        "elevation-card-rest": "0 1px 2px rgba(27, 25, 19, 0.06)",
        "elevation-card-hover": "0 4px 12px rgba(27, 25, 19, 0.08)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        "3xl": "2rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-top": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out-top": {
          "0%": { height: "100%" },
          "99%": { height: "0" },
          "100%": { visibility: "hidden" },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
