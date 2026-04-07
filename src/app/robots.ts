import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/*/opengraph-image",
      },
    ],
    sitemap: "https://valueperfan.com/sitemap.xml",
  };
}
