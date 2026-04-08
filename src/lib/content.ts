import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export const AREA_LABELS = {
  motion: "Motion Graphics / Audiovisual",
  print: "Producción Gráfica / Imprenta",
  web: "Desarrollo Web"
} as const;

export const CATEGORY_LABELS = {
  motion: "Motion Graphics",
  print: "Producción Gráfica",
  web: "Desarrollo Web",
  reflexiones: "Reflexiones",
  vida: "Vida diaria",
  hacks: "Hacks"
} as const;

export const STATUS_LABELS = {
  idea: "Idea",
  beta: "Beta",
  published: "Publicado",
  archived: "Archivado"
} as const;

const sortByDateDesc = <T extends CollectionEntry<"posts" | "projects">>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime();

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function fileLabel(path: string) {
  const name = path.split("/").pop() ?? path;
  return decodeURIComponent(name).replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export function routeSlug(entry: { id: string; data: { slug?: string } }) {
  return entry.data.slug ?? entry.id;
}

export async function getSiteSettings() {
  const site = await getEntry("settings", "site");

  if (!site) {
    throw new Error("No se encontró src/content/settings/site.json");
  }

  return site.data;
}

export async function getPageContent(slug: string) {
  const pages = await getCollection("pages", ({ data }) => !data.draft);
  return pages.find((entry) => routeSlug(entry) === slug);
}

export async function getVisiblePosts() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort(sortByDateDesc);
}

export async function getVisibleProjects() {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.sort(sortByDateDesc);
}

export async function getVisibleTools() {
  return getCollection("tools", ({ data }) => !data.draft);
}
