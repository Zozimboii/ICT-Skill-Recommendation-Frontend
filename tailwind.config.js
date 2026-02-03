module.exports = {
    content: ['./components/**/*.{vue,js,ts}', './pages/**/*.{vue,js,ts}', './layouts/**/*.{vue,js,ts}', './app.vue'],

    theme: {
        extend: {},
    },

    plugins: [require('@tailwindcss/typography')],
};
