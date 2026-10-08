import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let apiKey = "";
try {
  apiKey = readFileSync(resolve(process.cwd(), "../XDownload/.api-key"), "utf8").trim();
} catch {}

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        headers: apiKey ? { "X-Api-Key": apiKey } : {},
      },
    },
  },
});
