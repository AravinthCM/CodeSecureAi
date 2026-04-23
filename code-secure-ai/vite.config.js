import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true, // Allows using 'describe', 'it', 'expect' without importing
    environment: "jsdom", // Mimics a browser environment
    setupFiles: "./src/test/setup.ts", // Points to the setup file we'll create
    css: true, // Essential if you test components that depend on MUI/Tailwind visibility
  },
});
