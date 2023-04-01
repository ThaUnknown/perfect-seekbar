import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    server: {
      open: './debug/'
    },
    build: {
      lib: {
        entry: './src/main.js',
        name: 'perfect-seekbar'
      }
    },
    plugins: null
  }
  if (mode === 'development') {
    config.plugins = [svelte()]
  } else {
    config.plugins = [
      svelte({
        compilerOptions: {
          customElement: true
        },
        include: /perfect-seekbar\.svelte$/
      }),
      svelte({
        compilerOptions: {
          customElement: false
        },
        exclude: /perfect-seekbar\.svelte$/
      })
    ]
  }
  return config
})
