"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SectionEditor } from "@/components/owner/SectionEditor";
import { BackendApiError, validateSiteConfig } from "@/lib/api/backend";
import { SiteRenderer } from "@/renderer/SiteRenderer";
import {
  getOwnedSiteBySlug,
  publishOwnerSite,
  updateOwnerSiteConfig,
  type OwnedSiteView,
} from "@/lib/sites/owner-sites";
import { replaceSectionInConfig, sectionLabel } from "@/lib/sites/section-edit";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { SiteSection, WebsiteConfig } from "@/lib/types/website-config";

export default function OwnerSitePreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [view, setView] = useState<OwnedSiteView | null>(null);
  const [previewConfig, setPreviewConfig] = useState<WebsiteConfig | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const supabase = createBrowserSupabaseClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabase || !supabaseUrl) {
        if (active) {
          setError("Supabase env vars are missing.");
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        router.replace("/owner/login");
        return;
      }

      try {
        const owned = await getOwnedSiteBySlug(
          supabase,
          user.id,
          slug,
          supabaseUrl,
        );
        if (!owned) {
          setError("Site not found for this account.");
        } else if (active) {
          setView(owned);
          setPreviewConfig(owned.config);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [router, slug]);

  const selectedSection = useMemo(() => {
    if (!previewConfig || !selectedSectionId) {
      return null;
    }
    return (
      previewConfig.sections.find((section) => section.id === selectedSectionId) ??
      null
    );
  }, [previewConfig, selectedSectionId]);

  function applyDraftSection(nextSection: SiteSection) {
    if (!previewConfig) {
      return;
    }
    try {
      setPreviewConfig(replaceSectionInConfig(previewConfig, nextSection));
    } catch {
      // ignore stale id while switching sections
    }
  }

  async function onPublish() {
    if (!view) {
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setPublishing(true);
    setError(null);
    setStatus(null);
    try {
      const published = await publishOwnerSite(supabase, view.site.id);
      setView({ ...view, site: published });
      setStatus("Published. Public visitors can open /site/" + published.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function onSaveSection(nextSection: SiteSection) {
    if (!view || !previewConfig) {
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const nextConfig = replaceSectionInConfig(previewConfig, nextSection);
      const validated = await validateSiteConfig(nextConfig);
      const updated = await updateOwnerSiteConfig(
        supabase,
        view.site.id,
        validated.config,
      );
      setView({
        ...view,
        site: updated,
        config: validated.config,
      });
      setPreviewConfig(validated.config);
      setStatus(`Saved ${sectionLabel(nextSection)}.`);
    } catch (err) {
      if (err instanceof BackendApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Could not save section.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="owner-shell">
        <p className="text-sm owner-muted-text">Loading draft preview…</p>
      </main>
    );
  }

  if ((error && !view) || !view || !previewConfig) {
    return (
      <main className="owner-shell">
        <div className="relative mx-auto max-w-xl owner-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
            SiteCraft
          </p>
          <h1 className="owner-heading mt-3 text-3xl">Preview unavailable</h1>
          <p className="mt-3 text-sm text-red-700">
            {error || "Preview unavailable."}
          </p>
          <p className="mt-6">
            <Link href="/owner/create" className="owner-btn-primary">
              Back to builder
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 text-[#0f172a] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
              SiteCraft · owner preview
            </p>
            <p className="mt-1 text-sm">
              <span className="owner-heading text-base">
                {view.site.business_name}
              </span>
              <span className="mx-2 text-[#cbd5e1]">·</span>
              <span className="owner-muted-text">/{view.site.slug}</span>
              <span className="mx-2 text-[#cbd5e1]">·</span>
              <span
                className={
                  view.site.status === "published"
                    ? "text-[#0f766e]"
                    : "owner-muted-text"
                }
              >
                {view.site.status}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/owner/create" className="owner-btn-ghost !px-4 !py-2">
              Builder
            </Link>
            <Link href="/owner/media" className="owner-btn-ghost !px-4 !py-2">
              Media
            </Link>
            <button
              type="button"
              onClick={() => void onPublish()}
              disabled={publishing || view.site.status === "published"}
              className="owner-btn-primary !px-4 !py-2"
            >
              {view.site.status === "published"
                ? "Published"
                : publishing
                  ? "Publishing…"
                  : "Publish"}
            </button>
            {view.site.status === "published" ? (
              <Link
                href={`/site/${view.site.slug}`}
                className="owner-link text-sm text-[#0f766e]"
              >
                Open public site
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-[#e2e8f0] px-4 py-2.5 sm:px-6">
          <span className="shrink-0 self-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
            Edit
          </span>
          {previewConfig.sections.map((section) => {
            const active = section.id === selectedSectionId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setSelectedSectionId((current) =>
                    current === section.id ? null : section.id,
                  )
                }
                className={`shrink-0 border px-3 py-1.5 text-xs capitalize transition ${
                  active
                    ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]"
                    : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1]"
                }`}
              >
                {section.type}
              </button>
            );
          })}
        </div>

        {status ? (
          <p className="px-4 pb-2 text-xs text-[#0f766e] sm:px-6">{status}</p>
        ) : null}
        {error ? (
          <p className="px-4 pb-2 text-xs text-red-700 sm:px-6">{error}</p>
        ) : null}
      </div>

      <div className="w-full">
        <SiteRenderer config={previewConfig} mediaById={view.mediaById} />
      </div>

      {selectedSection ? (
        <>
          <button
            type="button"
            aria-label="Close editor"
            className="fixed inset-0 z-40 bg-[#0f172a]/35"
            onClick={() => setSelectedSectionId(null)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#e2e8f0] bg-white shadow-2xl">
            <SectionEditor
              key={selectedSection.id}
              section={selectedSection}
              mediaById={view.mediaById}
              saving={saving}
              onCancel={() => setSelectedSectionId(null)}
              onDraftChange={applyDraftSection}
              onSave={onSaveSection}
            />
          </aside>
        </>
      ) : null}
    </div>
  );
}
