/**
 * Builds a search-based embed URL that works in an iframe when no custom map URL exists.
 */
export function fallbackEmbedFromVenue(
  venueName: string,
  venueAddress: string,
): string {
  const q = `${venueName} ${venueAddress}`.trim() || "venue";
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

function ensureHttps(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function isGoogleMapsHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "maps.google.com" ||
    h.endsWith(".google.com") ||
    h === "goo.gl" ||
    h.endsWith(".goo.gl") ||
    h === "maps.app.goo.gl"
  );
}

/**
 * Converts stored map URLs (embed, place, search, ?q=) into iframe-safe embed URLs.
 * Short links (goo.gl / maps.app.goo.gl) cannot be expanded in the browser; falls back to venue search.
 */
export function resolveGoogleMapsEmbedSrc(
  mapEmbedUrl: string | undefined | null,
  venueName: string,
  venueAddress: string,
): string {
  const fallback = fallbackEmbedFromVenue(venueName, venueAddress);
  const raw = mapEmbedUrl?.trim() ?? "";
  if (!raw) return fallback;

  const urlStr = ensureHttps(raw);
  let u: URL;
  try {
    u = new URL(urlStr);
  } catch {
    return fallback;
  }

  if (!isGoogleMapsHost(u.hostname)) {
    if (/embed/i.test(urlStr)) return urlStr;
    return fallback;
  }

  const host = u.hostname.toLowerCase();
  if (
    host === "goo.gl" ||
    host.endsWith(".goo.gl") ||
    host === "maps.app.goo.gl"
  ) {
    return fallback;
  }

  if (u.pathname.includes("/embed")) {
    return urlStr;
  }

  const pb = u.searchParams.get("pb");
  if (pb) {
    return `https://www.google.com/maps/embed?pb=${encodeURIComponent(pb)}`;
  }

  if (u.searchParams.get("output") === "embed") {
    return urlStr;
  }

  const coordMatch = urlStr.match(/@(-?\d+\.?\d*),(-?\d+\.?\d+)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }

  if (u.pathname.includes("/search")) {
    const q =
      u.searchParams.get("query") ?? u.searchParams.get("q");
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  }

  const ll = u.searchParams.get("ll");
  if (ll && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(ll)) {
    return `https://www.google.com/maps?q=${encodeURIComponent(ll)}&z=16&output=embed`;
  }

  const qParam = u.searchParams.get("q") ?? u.searchParams.get("query");
  if (qParam) {
    return `https://www.google.com/maps?q=${encodeURIComponent(qParam)}&output=embed`;
  }

  const placeMatch = u.pathname.match(/\/place\/([^/]+)/);
  if (placeMatch) {
    try {
      const name = decodeURIComponent(
        placeMatch[1].replace(/\+/g, " "),
      );
      if (name.length > 0) {
        return `https://www.google.com/maps?q=${encodeURIComponent(name)}&output=embed`;
      }
    } catch {
      /* ignore */
    }
  }

  if (u.pathname.includes("/maps/")) {
    return fallback;
  }

  return fallback;
}

/** Use when saving from the couple dashboard so stored URLs are embed-friendly when possible. */
export function normalizeMapEmbedUrlForSave(
  raw: string,
  venueName: string,
  venueAddress: string,
): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return fallbackEmbedFromVenue(venueName, venueAddress);
  }
  return resolveGoogleMapsEmbedSrc(trimmed, venueName, venueAddress);
}

function fallbackOpenFromVenue(venueName: string, venueAddress: string): string {
  const q = `${venueName} ${venueAddress}`.trim() || "venue";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * URL for "Open in Google Maps" (new tab / app). Prefers the couple’s saved map link
 * when it can be normalized; otherwise searches by venue name + address (same as before).
 */
export function resolveGoogleMapsOpenUrl(
  mapEmbedUrl: string | undefined | null,
  venueName: string,
  venueAddress: string,
): string {
  const fallback = fallbackOpenFromVenue(venueName, venueAddress);
  const raw = mapEmbedUrl?.trim() ?? "";
  if (!raw) return fallback;

  const urlStr = ensureHttps(raw);
  let u: URL;
  try {
    u = new URL(urlStr);
  } catch {
    return fallback;
  }

  if (!isGoogleMapsHost(u.hostname)) {
    if (/^https?:\/\//i.test(urlStr)) return urlStr;
    return fallback;
  }

  const host = u.hostname.toLowerCase();
  if (
    host === "goo.gl" ||
    host.endsWith(".goo.gl") ||
    host === "maps.app.goo.gl"
  ) {
    return fallback;
  }

  if (u.pathname.includes("/place/") || u.pathname.includes("/dir/")) {
    return urlStr;
  }

  if (u.pathname.includes("/embed")) {
    const pb = u.searchParams.get("pb");
    if (pb) {
      return `https://www.google.com/maps?pb=${encodeURIComponent(pb)}`;
    }
  }

  const pb = u.searchParams.get("pb");
  if (pb) {
    return `https://www.google.com/maps?pb=${encodeURIComponent(pb)}`;
  }

  if (u.searchParams.get("output") === "embed") {
    const next = new URL(u.toString());
    next.searchParams.delete("output");
    return next.toString();
  }

  const coordMatch = urlStr.match(/@(-?\d+\.?\d*),(-?\d+\.?\d+)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lng}`,
    )}`;
  }

  if (u.pathname.includes("/search")) {
    const q = u.searchParams.get("query") ?? u.searchParams.get("q");
    if (q) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    }
  }

  const ll = u.searchParams.get("ll");
  if (ll && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(ll)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`;
  }

  const qParam = u.searchParams.get("q") ?? u.searchParams.get("query");
  if (qParam) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qParam)}`;
  }

  if (u.hostname.includes("google") && u.pathname.includes("maps")) {
    return urlStr;
  }

  return fallback;
}
