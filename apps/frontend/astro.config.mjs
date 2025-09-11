// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias:
        (import.meta.env.PROD && {
          "react-dom/server": "react-dom/server.edge",
        }) ||
        undefined,
    },
  },
  integrations: [react()],
});
