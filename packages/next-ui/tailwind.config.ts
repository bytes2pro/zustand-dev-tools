import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  important: '.zustand-devtools',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './domains/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        shine: {
          DEFAULT: 'linear-gradient(to bottom, #d969e0, #b475fd)',
          from: '#d969e0',
          to: '#b475fd',
          foreground: '#fff',
          ring: '#b475fd', // for ring color
          before: 'linear-gradient(to bottom, rgba(255,255,255,0.20), rgba(255,255,255,0.20))',
          after:
            'linear-gradient(to bottom, rgba(255,255,255,0.10) 46%, rgba(255,255,255,0.54) 54%)',
        },
        // Inline animation colors with opacity variants
        inline: {
          primary: '#d969e0',
          secondary: '#b475fd',
          '10': '#d969e01a', // 10% opacity
          '12': '#d969e01f', // 12% opacity
          '15': '#b475fd26', // 15% opacity
          '16': '#b475fd29', // 16% opacity
          '20': '#b475fd33', // 20% opacity
          '25': '#d969e040', // 25% opacity
          '30': '#b475fd4d', // 30% opacity
        },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
      },
      fontSize: {
        'xs-plus': ['13px', '18px'], // Between xs (12px) and sm (14px)
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionDuration: {
        '120': '120ms',
        '160': '160ms',
        '240': '240ms',
        '320': '320ms',
        '400': '400ms',
        '480': '480ms',
        '560': '560ms',
      },
      transitionTimingFunction: {
        'custom-bezier': 'cubic-bezier(0.4, 0.36, 0, 1)',
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
      keyframes: {
        // Standard animations (updated with faster timings)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0.8' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0.8' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        // Legacy animations (kept for backward compatibility)
        'appear-from-bottom': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'drag-hold-feedback': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        // Shimmer and special effects
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-smooth': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shine: {
          '0%': { transform: 'translateX(-60%) skewX(-12deg)', opacity: '0' },
          '100%': { transform: 'translateX(120%) skewX(-12deg)', opacity: '1' },
        },
      },
      animation: {
        // Standard animations (faster timings - 20% speed increase)
        'accordion-down': 'accordion-down 160ms ease-out',
        'accordion-up': 'accordion-up 160ms ease-out',
        'fade-in': 'fade-in 160ms cubic-bezier(0.0, 0.0, 0.2, 1)',
        'fade-out': 'fade-out 160ms cubic-bezier(0.4, 0.0, 1, 1)',
        'slide-in-right': 'slide-in-right 240ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards',
        'slide-out-right': 'slide-out-right 240ms cubic-bezier(0.4, 0.0, 1, 1) forwards',
        'slide-in-left': 'slide-in-left 160ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards',
        'slide-out-left': 'slide-out-left 160ms cubic-bezier(0.4, 0.0, 1, 1) forwards',
        'slide-up': 'slide-up 240ms cubic-bezier(0.0, 0.0, 0.2, 1)',
        'scale-in': 'scale-in 160ms cubic-bezier(0.0, 0.0, 0.2, 1)',
        'scale-out': 'scale-out 160ms cubic-bezier(0.4, 0.0, 1, 1)',
        // Legacy animations (updated timings for backward compatibility)
        'appear-from-bottom': 'appear-from-bottom 240ms cubic-bezier(0.0, 0.0, 0.2, 1)',
        'drag-hold-feedback': 'drag-hold-feedback 120ms ease-in-out',
        // Special effects
        shimmer: 'shimmer 2s linear infinite',
        'fade-in-smooth': 'fade-in-smooth 1.6s ease-in-out forwards',
        shine: 'shine 400ms ease-out forwards',
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
