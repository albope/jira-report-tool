import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base colors from CSS variables
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Primary palette
        primary: {
          50: "#EBF5FF",
          100: "#E1EFFE",
          200: "#C3DDFD",
          300: "#A4CAFE",
          400: "#76A9FA",
          500: "#0066FF",
          600: "#0052CC",
          700: "#0043A8",
          800: "#003585",
          900: "#002966",
          DEFAULT: "#0066FF",
        },

        // Semantic colors
        success: {
          50: "#E6F7E6",
          100: "#CCEFCC",
          200: "#99DF99",
          300: "#66CF66",
          400: "#33BF33",
          500: "#00AA55",
          600: "#008844",
          700: "#006633",
          800: "#004422",
          900: "#002211",
          DEFAULT: "#00AA55",
        },
        error: {
          50: "#FFEBEB",
          100: "#FFD6D6",
          200: "#FFADAD",
          300: "#FF8585",
          400: "#FF5C5C",
          500: "#FF3333",
          600: "#CC2929",
          700: "#991F1F",
          800: "#661414",
          900: "#330A0A",
          DEFAULT: "#FF3333",
        },
        warning: {
          50: "#FFF4E6",
          100: "#FFE9CC",
          200: "#FFD399",
          300: "#FFBD66",
          400: "#FFA733",
          500: "#FF9900",
          600: "#CC7A00",
          700: "#995C00",
          800: "#663D00",
          900: "#331F00",
          DEFAULT: "#FF9900",
        },

        // Neutral palette for surfaces
        surface: {
          50: "#FAFBFC",
          100: "#F5F7FA",
          200: "#E4E7EB",
          300: "#CBD2D9",
          400: "#9AA5B1",
          500: "#7B8794",
          600: "#616E7C",
          700: "#52606D",
          800: "#3E4C59",
          900: "#1F2933",
          DEFAULT: "#F5F7FA",
        },
      },

      // Typography scale
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],   // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }],           // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],       // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],          // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],       // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],        // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],         // 24px
        "3xl": ["2rem", { lineHeight: "2.5rem" }],         // 32px
        "4xl": ["2.5rem", { lineHeight: "3rem" }],         // 40px
      },

      // Consistent spacing
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },

      // Box shadows
      boxShadow: {
        "soft": "0 2px 8px -2px rgba(0, 0, 0, 0.1)",
        "medium": "0 4px 12px -4px rgba(0, 0, 0, 0.15)",
        "strong": "0 8px 24px -8px rgba(0, 0, 0, 0.2)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
      },

      // Border radius
      borderRadius: {
        "4xl": "2rem",
      },

      // Animations
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-in",
        "fade-out": "fadeOut 0.2s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        // Premium animations
        "gradient": "gradient 3s linear infinite",
        "glow": "glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out infinite 3s",
        "spotlight": "spotlight 2s ease-in-out infinite",
        "border-glow": "borderGlow 3s linear infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // Premium keyframes
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spotlight: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        borderGlow: {
          "0%, 100%": {
            borderColor: "rgba(59, 130, 246, 0.3)",
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)"
          },
          "50%": {
            borderColor: "rgba(139, 92, 246, 0.5)",
            boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)"
          },
        },
      },

      // Transitions
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
