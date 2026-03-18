import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "CCBot",
          "anthropic-ai",
          "ClaudeBot",
          "Bytespider",
          "PerplexityBot",
          "Applebot-Extended",
          "cohere-ai",
          "Diffbot",
          "FacebookBot",
          "ImagesiftBot",
          "Omgilibot",
          "Omgili",
        ],
        disallow: "/account/",
      },
    ],
    sitemap: "https://valueperfan.com/sitemap.xml",
  };
}
