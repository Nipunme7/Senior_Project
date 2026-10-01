"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { mediaRowsToAssets } from "@/lib/media/resolve-rows";
import { listSiteMedia, uploadSiteMedia } from "@/lib/media/upload";
import { createOwnerSite, listOwnedSites } from "@/lib/sites/owner-sites";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { MediaRow, SiteRow } from "@/lib/supabase/database.types";

export default function OwnerMediaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const refreshMedia = useCallback(async (siteId: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !siteId) {
      setMedia([]);
      return;
    }
    const rows = await listSiteMedia(supabase, siteId);
    setMedia(rows);
  }, []);

  const refreshSites = useCallback(async (ownerId: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }
    const owned = await listOwnedSites(supabase, ownerId);
    setSites(owned);
    setSelectedSiteId((current) => current || owned[0]?.id || "");
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        if (!active) {
          return;
        }
        setError("Supabase env vars are missing. Add them to frontend/.env.");
        setLoading(false);
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!currentUser) {
        router.replace("/owner/login");
        return;
      }

      setUser(currentUser);
      try {
        await refreshSites(currentUser.id);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load sites.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [router, refreshSites]);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!selectedSiteId) {
        if (active) {
          setMedia([]);
        }
        return;
      }

      try {
        await refreshMedia(selectedSiteId);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load media.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedSiteId, refreshMedia]);

  async function onCreateSite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const supabase = createBrowserSupabaseClient();
    if (!supabase || !user) {
      setError("You must be signed in.");
      return;
    }

    try {
      const site = await createOwnerSite(supabase, user.id, {
        businessName,
        slug,
      });
      setBusinessName("");
      setSlug("");
      setStatus(`Created site “${site.business_name}” (${site.slug}).`);
      await refreshSites(user.id);
      setSelectedSiteId(site.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create site.");
    }
  }

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!selectedSiteId) {
      setError("Create or select a site first.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setUploading(true);
    try {
      const { media: row } = await uploadSiteMedia(supabase, {
        siteId: selectedSiteId,
        file,
        description,
      });
      setFile(null);
      setDescription("");
      setStatus(`Uploaded. Media ID: ${row.id}`);
      await refreshMedia(selectedSiteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/owner/login");
  }

  const assets = supabaseUrl ? mediaRowsToAssets(media, supabaseUrl) : {};

  if (loading) {
    return (
      <main className="min-h-screen bg-[#111111] px-6 py-20 text-[#f4f1ea]">
        <p className="text-sm text-[#cfc9bb]">Loading owner media…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C9A45C]">
              Phase 6
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
              Site media
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[#cfc9bb]">
              Upload images or small videos to Supabase Storage. The app stores a
              media row and exposes a stable media ID for WebsiteConfig.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="text-sm text-[#cfc9bb] underline"
          >
            Sign out
          </button>
        </div>

        <section className="mt-12 border border-white/15 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Your sites
          </h2>
          {sites.length === 0 ? (
            <p className="mt-3 text-sm text-[#cfc9bb]">
              No sites yet. Create one below, then upload media.
            </p>
          ) : (
            <label className="mt-4 block text-sm">
              <span className="text-[#cfc9bb]">Selected site</span>
              <select
                value={selectedSiteId}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                className="mt-2 w-full border border-white/20 bg-[#111111] px-3 py-2"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.business_name} ({site.slug}) — {site.status}
                  </option>
                ))}
              </select>
            </label>
          )}

          <form onSubmit={onCreateSite} className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-1">
              <span className="text-[#cfc9bb]">Business name</span>
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                required
                className="mt-2 w-full border border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm sm:col-span-1">
              <span className="text-[#cfc9bb]">Slug</span>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
                placeholder="my-shop"
                className="mt-2 w-full border border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 border border-white/25 px-4 py-3 text-sm uppercase tracking-[0.16em] hover:border-[#C9A45C]"
            >
              Create draft site
            </button>
          </form>
        </section>

        <section className="mt-8 border border-white/15 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Upload
          </h2>
          <p className="mt-2 text-sm text-[#cfc9bb]">
            Images up to 5MB (JPEG/PNG/WebP/GIF). Videos up to 20MB (MP4/WebM),
            max 3 per site.
          </p>
          <form onSubmit={onUpload} className="mt-6 space-y-4">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[#cfc9bb]"
            />
            <label className="block text-sm">
              <span className="text-[#cfc9bb]">Description / alt text</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full border border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={uploading || !selectedSiteId}
              className="border border-[#C9A45C] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#C9A45C] hover:bg-[#C9A45C] hover:text-[#111111] disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload media"}
            </button>
          </form>
        </section>

        <section className="mt-8 border border-white/15 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Media library
          </h2>
          {media.length === 0 ? (
            <p className="mt-3 text-sm text-[#cfc9bb]">No media for this site yet.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {media.map((row) => {
                const asset = assets[row.id];
                return (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 border border-white/10 p-4 sm:flex-row sm:items-center"
                  >
                    {asset?.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.alt}
                        className="h-20 w-28 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-28 items-center justify-center border border-white/15 text-xs uppercase tracking-wider text-[#cfc9bb]">
                        Video
                      </div>
                    )}
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-mono text-[#C9A45C]">{row.id}</p>
                      <p className="mt-1 text-[#cfc9bb]">
                        {row.type} · {row.description || "No description"}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/50">
                        {row.storage_path}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}
        {status ? <p className="mt-6 text-sm text-[#C9A45C]">{status}</p> : null}

        <p className="mt-10 text-sm">
          <Link href="/" className="text-[#C9A45C] underline">
            Back home
          </Link>
        </p>
      </div>
    </main>
  );
}
