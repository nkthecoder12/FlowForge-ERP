/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx,js,jsx}',
        './components/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#F5F5F5',
                card: '#F8E7F6',
                highlight: '#DD88CF',
                primary: '#4B164C',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
