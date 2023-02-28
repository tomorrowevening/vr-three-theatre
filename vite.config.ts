import { defineConfig } from 'vite'
import { resolve } from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['three'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          three: 'Three',
        }
      }
    }
  },
  server: {
    https: true,
    port: 3030,
  },
  plugins: [basicSsl()],
})