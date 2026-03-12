import type { FrameMasterConfig } from "frame-master/server/types";
import ReactToHtml from "frame-master-plugin-react-to-html";
import ApplyReact from "frame-master-plugin-apply-react/plugin";
import TailwindPlugin from "frame-master-plugin-tailwind";
import imageOptimizer from "frame-master-plugin-image-optimizer";
import AssetsToBuild from "frame-master-plugin-assets-to-build";
import SVGLoader from "frame-master-svg-to-jsx-loader";
import SEOPlugin from "frame-master-plugin-seo";
import SiteConfig from "./site.config";
import AutoSiteMap from "frame-master-plugin-auto-sitemap";
import { builder } from "frame-master/build";
import functionAction from "frame-master-plugin-cloudflare-pages-functions-action";
import EnvToHtml from "frame-master-plugin-env-in-html";
import type { ClientType } from "./src/auth";

export default {
  HTTPServer: {
    port: 3001,
  },
  plugins: [
    ReactToHtml({
      shellPath: "src/shell.tsx",
      srcDir: "src/pages",
      entrypointExtensions: [".tsx"],
    }),
    ApplyReact({
      clientShellPath: "src/client-wrapper.tsx",
      route: "src/pages",
      style: "nextjs",
      entrypointExtensions: [".tsx"],
    }),
    TailwindPlugin({
      inputFile: "static/tailwind.css",
      outputFile: "static/style.css",
      options: {
        autoInjectInBuild: true,
        runtime: "bun",
      },
    }),
    imageOptimizer({
      input: "images",
      output: "optimized",
      skipExisting: true,
      formats: ["webp"],
      keepOriginal: true,
      sizes: [320, 720, 1280],
    }),
    SVGLoader(),
    AssetsToBuild({
      paths: [
        {
          src: "optimized",
          dist: "optimized",
        },
        {
          src: "static/favicon.ico",
          dist: "favicon.ico",
        },
        {
          src: "static",
          dist: "static",
        },
        {
          src: "robots.txt",
          dist: "robots.txt",
        },
      ],
    }),
    SEOPlugin(SiteConfig.SEO),
    AutoSiteMap({
      baseUrl: SiteConfig.siteUrl,
      authorizedExtensions: ["html"],
    }),
    EnvToHtml({
      prefix: "PUBLIC_",
      entries: ["NODE_ENV"],
    }),
    {
      name: "static-assets",
      version: "1.0.0",
      build: {
        buildConfig: {
          naming: {
            asset: "[dir]/[name].[ext]",
          },
        },
      },
    },
    {
      name: "dev-plugin",
      version: "1.0.0",
      fileSystemWatchDir: ["src"],
      async onFileSystemChange(ev, fp, abs) {
        if (!abs.startsWith("src/") || builder?.isBuilding()) return;
        await builder?.build();
      },
    },
    functionAction({
      outDir: ".frame-master/build",
      actionBasePath: "src/actions",
      customFetch: ((input, init) => {
        const client = (globalThis as any)._CLIENT_ as ClientType;
        if (!client) return fetch(input, init);
        return fetch(input, {
          ...init,
          headers: new Headers({
            ...init?.headers,
            Authorization: `Bearer ${client.getToken()}`,
          }),
        });
      }) as typeof fetch,
    }),
  ],
} satisfies FrameMasterConfig;
