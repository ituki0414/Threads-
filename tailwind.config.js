/**
 * ThreadStep Tailwind Config
 * Threads風デザインシステム - 統一されたデザイントークン
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // カラーシステム - Threads風
      colors: {
        // Primary - 黒ベース
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Background
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Card
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Popover
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Secondary
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Muted
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Accent
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Destructive
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // Semantic colors
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        // Border
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      // フォントファミリー - Threads風
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      // フォントサイズ - 統一されたスケール
      fontSize: {
        xs: ['0.625rem', { lineHeight: '1.2' }],    // 10px
        sm: ['0.75rem', { lineHeight: '1.5' }],     // 12px
        base: ['0.875rem', { lineHeight: '1.5' }],  // 14px
        md: ['0.9375rem', { lineHeight: '1.5' }],   // 15px
        lg: ['1rem', { lineHeight: '1.5' }],        // 16px
        xl: ['1.125rem', { lineHeight: '1.5' }],    // 18px
        '2xl': ['1.25rem', { lineHeight: '1.4' }],  // 20px
        '3xl': ['1.5rem', { lineHeight: '1.3' }],   // 24px
        '4xl': ['2rem', { lineHeight: '1.2' }],     // 32px
      },
      // 角丸 - Threads風
      borderRadius: {
        lg: 'var(--radius)',               // 12px
        md: 'calc(var(--radius) - 4px)',   // 8px
        sm: 'calc(var(--radius) - 8px)',   // 4px
      },
      // シャドウ - 控えめ
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // アニメーション - Threads風のスムーズな動き
      animation: {
        'fade-in': 'fadeIn 150ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            transform: 'translateY(10px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        scaleIn: {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
      },
      // トランジション
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
