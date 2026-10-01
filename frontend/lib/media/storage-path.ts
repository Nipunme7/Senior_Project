/**
 * Build a Storage object path:
 *   site-media/{siteId}/{unique}-{safeFileName}
 */
export function buildSiteMediaPath(siteId: string, fileName: string): string {
  const safeSiteId = siteId.trim();
  if (!safeSiteId) {
    throw new Error("siteId is required for media storage paths.");
  }

  const base = fileName.split(/[/\\]/).pop()?.trim() || "upload";
  const safeName = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return `${safeSiteId}/${unique}-${safeName}`;
}
