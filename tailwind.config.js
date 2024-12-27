/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import scrollbar from 'tailwind-scrollbar'
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx,js,jsx}'],

  theme: {
    extend: {
      opacity: {
        3: '0.03'
      }
      // 在这里添加自定义类
    }
  },
  plugins: [daisyui, scrollbar]
}
