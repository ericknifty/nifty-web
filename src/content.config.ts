import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const stringListField = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\r\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string()));

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    category: z.enum(["motion", "print", "web", "reflexiones", "vida", "hacks"]),
    excerpt: z.string(),
    cover: z.string().optional(),
    tags: stringListField,
    downloads: stringListField,
    videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
    videoFile: z.union([z.string(), z.literal("")]).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    area: z.enum(["motion", "print", "web"]),
    date: z.coerce.date(),
    summary: z.string(),
    cover: z.string().optional(),
    gallery: stringListField,
    tags: stringListField,
    downloads: stringListField,
    videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
    videoFile: z.union([z.string(), z.literal("")]).optional(),
    lottieFile: z.union([z.string(), z.literal("")]).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string(),
    status: z.enum(["idea", "beta", "published", "archived"]),
    cover: z.string().optional(),
    demoPath: z.union([z.string(), z.literal("")]).optional(),
    externalUrl: z.union([z.string().url(), z.literal("")]).optional(),
    downloads: stringListField,
    lottieFile: z.union([z.string(), z.literal("")]).optional(),
    draft: z.boolean().default(false)
  })
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    intro: z.string().optional(),
    lead: z.string().optional(),
    draft: z.boolean().default(false),
    attachments: stringListField
  })
});

const settings = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/settings" }),
  schema: z.object({
    siteName: z.string(),
    siteTagline: z.string(),
    siteDescription: z.string(),
    email: z.string().email(),
    location: z.string(),
    primaryCtaLabel: z.string(),
    primaryCtaUrl: z.string(),
    secondaryCtaLabel: z.string().optional(),
    secondaryCtaUrl: z.string().optional(),
    socialVimeo: z.union([z.string().url(), z.literal("")]).optional(),
    socialLinkedIn: z.union([z.string().url(), z.literal("")]).optional(),
    socialGitHub: z.union([z.string().url(), z.literal("")]).optional(),
    socialInstagram: z.union([z.string().url(), z.literal("")]).optional()
  })
});

export const collections = {
  posts,
  projects,
  tools,
  pages,
  settings
};
