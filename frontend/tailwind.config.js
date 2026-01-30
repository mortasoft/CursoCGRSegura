/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Color Corporativo Primario: PANTONE REFLEX BLUE U
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#384A99', // Color base CGR
                    600: '#314188',
                    700: '#2a366e',
                    800: '#232d56',
                    900: '#1b2341',
                },
                // Color Corporativo Secundario: PANTONE 152 U
                secondary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#ea9a68',
                    400: '#fb923c',
                    500: '#E57B3C', // Color base CGR
                    600: '#d16a2d',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // Paleta Complementaria
                complementary: {
                    blue: '#28a9e0',   // Pantone 306 U
                    yellow: '#f8ae40', // Pantone 116 U
                    gray: '#dbdbdb',   // Pantone Cool Gray 1U
                },
                // Mantener accent para compatibilidad pero mapeado a colores complementarios
                accent: {
                    400: '#f8ae40', // Amarillo CGR
                    500: '#28a9e0', // Azul Claro CGR
                    600: '#0ea5e9',
                },
                border: '#dbdbdb', // Usar el gris corporativo para bordes
            },
            fontFamily: {
                // Tipografía corporativa
                sans: ['"Century Gothic"', 'CenturyGothic', 'AppleGothic', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
