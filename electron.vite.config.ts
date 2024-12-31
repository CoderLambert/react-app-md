import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      sourcemap: 'inline' // 开启渲染进程的 Source Map
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      sourcemap: 'inline' // 开启渲染进程的 Source Map
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      sourcemap: 'inline' // 开启渲染进程的 Source Map
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@common': resolve('src/common')
      }
    },
    plugins: [react()]
  }
})
