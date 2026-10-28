/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = fileURLToPath(new URL("./src", import.meta.url));
const pkg: unknown = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const version = typeof pkg === "object" && pkg !== null && typeof Reflect.get(pkg, "version") === "string" ? String(Reflect.get(pkg, "version")) : "0.0.0";

export default defineConfig({
  // Relative assets: the same build runs on Vercel and from file:// inside the
  // Electron shell. The app routes with the hash, so every page is index.html.
  base: "./",
  plugins: [tailwindcss(), react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  resolve: {
    // `~/` is our own code. `@/` stays free for upstream OpenWork imports once
    // the app lives in openwork/apps (see README "Naar openwork").
    alias: { "~": src },
  },
  server: {
    port: Number.parseInt(process.env.PORT ?? "", 10) || 5183,
    strictPort: true,
  },
  build: {
    target: "es2022",
    outDir: "dist",
    rollupOptions: {
      output: {
        // React is shared by every chunk and changes least, so it caches on
        // its own. Everything else (Base UI included) splits along the lazy
        // routes, so the projects page does not download the chat or settings.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (/node_modules\/(marked|dompurify)\//.test(id)) return "markdown";
          return undefined;
        },
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
