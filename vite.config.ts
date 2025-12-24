import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    // `react-apexcharts` expects `apexcharts` package. This project uses `apexcharts-clevision`,
    // so we alias it to keep compatibility.
    alias: [
      { find: /^apexcharts$/, replacement: path.resolve(__dirname, 'node_modules/apexcharts-clevision') },
      {
        find: /^apexcharts\/dist\/apexcharts\.common$/,
        replacement: path.resolve(__dirname, 'node_modules/apexcharts-clevision/dist/apexcharts.common.js')
      }
    ]
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
