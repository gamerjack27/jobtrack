import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  test: {
  environment: "jsdom",
  setupFiles: "./src/setupTests.js",
  coverage: {
    provider: "v8",
    include: ["src/**/*.{js,jsx}"],
    reporter: ["text", "html"],
  },
},
})