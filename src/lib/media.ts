export function isExternalUrl(value?: string) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function getVideoEmbed(url?: string) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (!videoId) return null;
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${videoId}`
      };
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      if (!videoId) return null;
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${videoId}`
      };
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).at(-1);
      if (!videoId) return null;
      return {
        type: "iframe",
        src: `https://player.vimeo.com/video/${videoId}`
      };
    }
  } catch {
    return null;
  }

  return {
    type: "link",
    src: url
  };
}
