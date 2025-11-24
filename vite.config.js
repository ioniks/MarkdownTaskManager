import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: "copy-to-root",
      closeBundle() {
        copyFileSync("dist/index.html", "task-manager.html");
      },
    },
  ],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
