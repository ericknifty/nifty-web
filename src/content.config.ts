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
    detailLead: z.string().optional(),
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
    detailLead: z.string().optional(),
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
    detailLead: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    heroTitle: z.string().optional(),
    eyebrow: z.string().optional(),
    intro: z.string().optional(),
    lead: z.string().optional(),
    panelEyebrow: z.string().optional(),
    panelTitle: z.string().optional(),
    panelBody: z.string().optional(),
    panelItems: stringListField,
    servicesEyebrow: z.string().optional(),
    serviceTitle: z.string().optional(),
    serviceItems: stringListField,
    featuredEyebrow: z.string().optional(),
    featuredTitle: z.string().optional(),
    portfolioSectionEyebrow: z.string().optional(),
    portfolioSectionTitle: z.string().optional(),
    portfolioSectionCtaLabel: z.string().optional(),
    areaMotionCopy: z.string().optional(),
    areaPrintCopy: z.string().optional(),
    areaWebCopy: z.string().optional(),
    postsSectionEyebrow: z.string().optional(),
    postsSectionTitle: z.string().optional(),
    postsSectionCtaLabel: z.string().optional(),
    toolsSectionEyebrow: z.string().optional(),
    toolsSectionTitle: z.string().optional(),
    toolsSectionCtaLabel: z.string().optional(),
    tabsEyebrow: z.string().optional(),
    tabsTitle: z.string().optional(),
    contactPrimaryLabel: z.string().optional(),
    contactPrimaryUrl: z.string().optional(),
    contactSecondaryLabel: z.string().optional(),
    contactSecondaryUrl: z.string().optional(),
    emptyTitle: z.string().optional(),
    emptyBody: z.string().optional(),
    heroImage: z.union([z.string(), z.literal("")]).optional(),
    heroImageAlt: z.string().optional(),
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
    socialInstagram: z.union([z.string().url(), z.literal("")]).optional(),
    navHomeLabel: z.string().optional(),
    navAboutLabel: z.string().optional(),
    navCvLabel: z.string().optional(),
    navPortfolioLabel: z.string().optional(),
    navBlogLabel: z.string().optional(),
    navToolsLabel: z.string().optional(),
    postDatePrefix: z.string().optional(),
    projectDatePrefix: z.string().optional(),
    projectGalleryEyebrow: z.string().optional(),
    projectGalleryTitle: z.string().optional(),
    downloadsEyebrow: z.string().optional(),
    downloadsTitle: z.string().optional(),
    videoEyebrow: z.string().optional(),
    videoTitle: z.string().optional(),
    videoExternalLabel: z.string().optional(),
    videoUnsupportedLabel: z.string().optional(),
    lottieEyebrow: z.string().optional(),
    lottieTitle: z.string().optional(),
    toolExternalCtaLabel: z.string().optional(),
    toolInternalCtaLabel: z.string().optional(),
    notFoundEyebrow: z.string().optional(),
    notFoundTitle: z.string().optional(),
    notFoundBody: z.string().optional(),
    notFoundCtaLabel: z.string().optional()
  })
});

const cvProfiles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cv-profiles" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    tabLabel: z.string(),
    summary: z.string().optional(),
    order: z.coerce.number().default(0),
    attachments: stringListField
  })
});

export const collections = {
  posts,
  projects,
  tools,
  pages,
  settings,
  cvProfiles
};
