import { storage } from "./storage";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const CANONICAL_ORIGIN = "https://jet-up.ai";

function toAbsoluteUrl(urlPath: string, baseUrl: string): string {
  if (!urlPath) return "";
  if (urlPath.startsWith("http")) return urlPath;
  return baseUrl ? `${baseUrl}${urlPath}` : urlPath;
}

export async function injectOgTags(url: string, html: string, baseUrl: string): Promise<string> {
  const eventMatch = url.match(/^\/event\/(\d+)/);
  const promoMatch = url.match(/^\/promo\/(\d+)/);

  if (eventMatch) {
    const id = parseInt(eventMatch[1]);
    try {
      const event = await storage.getScheduleEvent(id);
      if (event) {
        const title = escapeHtml(event.title);
        const desc = escapeHtml(`${event.speaker} — ${event.day || ""}, ${event.date || ""}${event.time ? `, ${event.time}` : ""}`);
        const image = toAbsoluteUrl(event.banner || event.speakerPhoto || "", CANONICAL_ORIGIN);
        return replaceOgTags(html, `JetUP: ${title}`, desc, image);
      }
    } catch {}
  }

  if (promoMatch) {
    const id = parseInt(promoMatch[1]);
    try {
      const promo = await storage.getPromotion(id);
      if (promo) {
        const title = escapeHtml(promo.title);
        const desc = escapeHtml(promo.subtitle || "");
        const image = toAbsoluteUrl(promo.banner || "", CANONICAL_ORIGIN);
        return replaceOgTags(html, `JetUP: ${title}`, desc, image);
      }
    } catch {}
  }

  return html;
}

function replaceOgTags(html: string, title: string, description: string, image: string): string {
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  if (image) {
    const imgTag = `<meta property="og:image" content="${image}" />`;
    const twImgTag = `<meta name="twitter:image" content="${image}" />`;
    if (html.includes('og:image')) {
      html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, imgTag);
    } else {
      html = html.replace(/<meta property="og:title"/, `${imgTag}\n    <meta property="og:title"`);
    }
    if (html.includes('twitter:image')) {
      html = html.replace(/<meta name="twitter:image" content="[^"]*" \/>/, twImgTag);
    } else {
      html = html.replace(/<meta name="twitter:title"/, `${twImgTag}\n    <meta name="twitter:title"`);
    }
  }

  return html;
}

export async function buildCrawlerHtml(url: string, baseUrl: string): Promise<string | null> {
  const eventMatch = url.match(/^\/event\/(\d+)/);
  const promoMatch = url.match(/^\/promo\/(\d+)/);

  let title = "JetUP";
  let description = "Your clear entry into the financial markets. Structure. Transparency. Control.";
  let image = "";
  let pageUrl = `${CANONICAL_ORIGIN}${url}`;

  if (eventMatch) {
    const id = parseInt(eventMatch[1]);
    const event = await storage.getScheduleEvent(id);
    if (!event) return null;
    title = `JetUP: ${escapeHtml(event.title)}`;
    description = escapeHtml(`${event.speaker} — ${event.day || ""}, ${event.date || ""}${event.time ? `, ${event.time}` : ""}`);
    image = toAbsoluteUrl(event.banner || event.speakerPhoto || "", CANONICAL_ORIGIN);
  } else if (promoMatch) {
    const id = parseInt(promoMatch[1]);
    const promo = await storage.getPromotion(id);
    if (!promo) return null;
    title = `JetUP: ${escapeHtml(promo.title)}`;
    description = escapeHtml(promo.subtitle || "");
    image = toAbsoluteUrl(promo.banner || "", CANONICAL_ORIGIN);
  } else {
    return null;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
${image ? `<meta property="og:image" content="${image}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
${image ? `<meta name="twitter:image" content="${image}" />` : ""}
</head>
<body></body>
</html>`;
}
