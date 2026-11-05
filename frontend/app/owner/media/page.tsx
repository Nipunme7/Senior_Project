"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { OwnerTopBar } from "@/components/owner/OwnerTopBar";
import { mediaRowsToAssets } from "@/lib/media/resolve-rows";
import {
  deleteSiteMedia,
  listSiteMedia,
  uploadSiteMedia,
} from "@/lib/media/upload";
import { listOwnedSites } from "@/lib/sites/owner-sites";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { MediaRow, SiteRow } from "@/lib/supabase/database.types";

export default function OwnerMediaPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function onDelete(row: MediaRow) {
    setError(null);
    setStatus(null);
    const label = row.description || row.id;
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setDeletingId(row.id);
    try {
      await deleteSiteMedia(supabase, row);
      setStatus(`Deleted “${label}”.`);
      await refreshMedia(selectedSiteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
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
      setError("Select a site first, or create one in the builder.");
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
  const selectedSite = sites.find((item) => item.id === selectedSiteId) ?? null;

  if (loading) {
    return (
      <main className="owner-shell">
        <p className="text-sm owner-muted-text">Loading media library…</p>
      </main>
    );
  }

  return (
    <main className="owner-shell">
      <div className="relative mx-auto max-w-5xl">
        <OwnerTopBar active="media" onSignOut={() => void onSignOut()} />

        <header className="mt-10 max-w-2xl">
          <h1 className="owner-heading text-4xl tracking-tight sm:text-5xl">
            Media library
          </h1>
          <p className="mt-3 text-sm leading-relaxed owner-muted-text">
            Upload photos and video for sites you already created in the builder.
          </p>
        </header>

        {sites.length === 0 ? (
          <section className="owner-panel mt-10 max-w-xl space-y-4">
            <h2 className="owner-heading text-2xl">No sites yet</h2>
            <p className="text-sm owner-muted-text">
              Create a draft in the builder first. Media uploads attach to that
              site.
            </p>
            <Link href="/owner/create" className="owner-btn-primary">
              Open builder
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <section className="owner-panel space-y-5">
                <h2 className="owner-heading text-2xl">Site</h2>
                <label className="owner-label">
                  Selected site
                  <select
                    value={selectedSiteId}
                    onChange={(event) => setSelectedSiteId(event.target.value)}
                    className="owner-input mt-2"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.business_name} ({site.slug}) — {site.status}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedSite ? (
                  <p className="text-sm owner-muted-text">
                    Working on{" "}
                    <span className="font-medium text-slate-900">
                      {selectedSite.business_name}
                    </span>{" "}
                    · /site/{selectedSite.slug}
                  </p>
                ) : null}
                <Link href="/owner/create" className="owner-link text-sm">
                  Back to builder
                </Link>
              </section>

              <section className="owner-panel space-y-5">
                <div>
                  <h2 className="owner-heading text-2xl">Upload</h2>
                  <p className="mt-2 text-sm owner-muted-text">
                    Images up to 5MB. Videos up to 20MB, max 3 per site.
                  </p>
                </div>
                <form onSubmit={onUpload} className="space-y-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm owner-muted-text"
                  />
                  <label className="owner-label">
                    Description / alt text
                    <input
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="owner-input mt-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={uploading || !selectedSiteId}
                    className="owner-btn-primary"
                  >
                    {uploading ? "Uploading…" : "Upload media"}
                  </button>
                </form>
              </section>
            </div>

            <section className="owner-panel mt-6">
              <h2 className="owner-heading text-2xl">Files</h2>
              {media.length === 0 ? (
                <p className="mt-3 text-sm owner-muted-text">
                  No media for this site yet.
                </p>
              ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {media.map((row) => {
                    const asset = assets[row.id];
                    return (
                      <li
                        key={row.id}
                        className="flex items-center gap-4 border border-[#e2e8f0] p-3"
                      >
                        {asset?.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.alt}
                            className="h-16 w-24 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-24 items-center justify-center border border-[#e2e8f0] text-[10px] uppercase tracking-wider text-[#64748b]">
                            Video
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-sm">
                          <p className="truncate text-[#0f766e]">
                            {row.description || row.id}
                          </p>
                          <p className="mt-1 text-xs text-[#64748b]">{row.type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void onDelete(row)}
                          disabled={deletingId === row.id}
                          className="shrink-0 text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
                        >
                          {deletingId === row.id ? "Deleting…" : "Delete"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}

        {error ? <p className="owner-alert-error mt-6">{error}</p> : null}
        {status ? <p className="owner-alert-ok mt-6">{status}</p> : null}
      </div>
    </main>
  );
}
