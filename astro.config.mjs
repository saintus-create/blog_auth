import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import { virtualMdxPlugin } from "./src/plugins/virtual-mdx.ts";

export default defineConfig({
  site: "https://astro-micro.vercel.app",
  integrations: [sitemap(), mdx(), pagefind()],
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      configPath: "wrangler.toml",
    },
  }),
  vite: {
    plugins: [tailwindcss(), virtualMdxPlugin()],
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
});
