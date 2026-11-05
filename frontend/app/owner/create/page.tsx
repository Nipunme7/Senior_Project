"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BackendApiError, generateSiteConfig, validateSiteConfig } from "@/lib/api/backend";
import { mediaRowsToAssets } from "@/lib/media/resolve-rows";
import {
  deleteSiteMedia,
  listSiteMedia,
  uploadSiteMedia,
} from "@/lib/media/upload";
import { BrandColorPicker } from "@/components/owner/BrandColorPicker";
import { OwnerTopBar } from "@/components/owner/OwnerTopBar";
import { SectionEditor } from "@/components/owner/SectionEditor";
import { SiteRenderer } from "@/renderer/SiteRenderer";
import {
  DEFAULT_BRAND_COLORS,
  DEFAULT_SECTION_TYPES,
  INSPIRATION_OPTIONS,
  SECTION_OPTIONS,
  brandColorsLabel,
  normalizeBrandColors,
  normalizeHexColor,
  themeColorsFromBrand,
  withThemeColors,
  type BrandColorCount,
} from "@/lib/owner/wizard-options";
import {
  createOwnerSite,
  listOwnedSites,
  publishOwnerSite,
  updateOwnerSiteConfig,
} from "@/lib/sites/owner-sites";
import { replaceSectionInConfig, sectionLabel } from "@/lib/sites/section-edit";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { MediaRow, SiteRow } from "@/lib/supabase/database.types";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import type { SectionType, SiteSection, WebsiteConfig } from "@/lib/types/website-config";

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Business" },
  { id: 2, label: "Look" },
  { id: 3, label: "Media" },
  { id: 4, label: "Generate" },
  { id: 5, label: "Edit" },
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OwnerCreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [description, setDescription] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("");

  const [inspirationId, setInspirationId] = useState(INSPIRATION_OPTIONS[0].id);
  const [brandColorCount, setBrandColorCount] = useState<BrandColorCount>(2);
  const [brandColors, setBrandColors] = useState<string[]>(() =>
    normalizeBrandColors(2, [...DEFAULT_BRAND_COLORS]),
  );
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([
    ...DEFAULT_SECTION_TYPES,
  ]);

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [site, setSite] = useState<SiteRow | null>(null);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [mediaDescription, setMediaDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [editConfig, setEditConfig] = useState<WebsiteConfig | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const inspiration = useMemo(
    () =>
      INSPIRATION_OPTIONS.find((item) => item.id === inspirationId) ??
      INSPIRATION_OPTIONS[0],
    [inspirationId],
  );

  const normalizedBrandColors = useMemo(
    () => normalizeBrandColors(brandColorCount, brandColors),
    [brandColorCount, brandColors],
  );

  const themeFromBrand = useMemo(
    () => themeColorsFromBrand(normalizedBrandColors),
    [normalizedBrandColors],
  );

  const refreshMedia = useCallback(async (siteId: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      return;
    }
    const rows = await listSiteMedia(supabase, siteId);
    setMedia(rows);
  }, []);

  const loadSiteIntoWizard = useCallback(
    async (row: SiteRow) => {
      setSite(row);
      setBusinessName(row.business_name);
      setSlug(row.slug);
      setSlugTouched(true);
      setBusinessType("");
      setDescription("");
      setServicesText("");
      setAddress("");
      setPhone("");
      setEmail("");
      setHours("");
      setInspirationId(INSPIRATION_OPTIONS[0].id);
      setSelectedSections([...DEFAULT_SECTION_TYPES]);
      setFile(null);
      setMediaDescription("");
      setError(null);
      await refreshMedia(row.id);
      const existing = parseWebsiteConfig(row.site_config);
      if (existing) {
        setBrandColorCount(2);
        setBrandColors(
          normalizeBrandColors(2, [
            existing.theme.primaryColor,
            existing.theme.accentColor,
          ]),
        );
      } else {
        setBrandColorCount(2);
        setBrandColors(normalizeBrandColors(2, [...DEFAULT_BRAND_COLORS]));
      }
      if (existing && existing.sections.length > 1) {
        setEditConfig(existing);
        setSelectedSectionId(existing.sections[0]?.id ?? null);
        setGenerated(true);
        setStep(5);
      } else {
        setEditConfig(existing);
        setSelectedSectionId(null);
        setGenerated(false);
        setStep(1);
      }
    },
    [refreshMedia],
  );

  function startNewWebsite() {
    setSite(null);
    setMedia([]);
    setBusinessName("");
    setSlug("");
    setSlugTouched(false);
    setBusinessType("");
    setDescription("");
    setServicesText("");
    setAddress("");
    setPhone("");
    setEmail("");
    setHours("");
    setInspirationId(INSPIRATION_OPTIONS[0].id);
    setBrandColorCount(2);
    setBrandColors(normalizeBrandColors(2, [...DEFAULT_BRAND_COLORS]));
    setSelectedSections([...DEFAULT_SECTION_TYPES]);
    setFile(null);
    setMediaDescription("");
    setGenerated(false);
    setEditConfig(null);
    setSelectedSectionId(null);
    setError(null);
    setStatus("New website — enter details, then Save draft & continue.");
    setStep(1);
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        if (active) {
          setError("Supabase env vars are missing. Add them to frontend/.env.");
          setLoading(false);
        }
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
        const owned = await listOwnedSites(supabase, currentUser.id);
        if (!active) {
          return;
        }
        setSites(owned);
        if (owned[0]) {
          await loadSiteIntoWizard(owned[0]);
        }
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
  }, [router, loadSiteIntoWizard]);

  const services = useMemo(
    () =>
      servicesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [servicesText],
  );

  const assets = supabaseUrl ? mediaRowsToAssets(media, supabaseUrl) : {};

  function toggleSection(type: SectionType, required?: boolean) {
    if (required) {
      return;
    }
    setSelectedSections((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type);
      }
      return [...current, type];
    });
  }

  async function ensureDraftSite(): Promise<{ site: SiteRow; created: boolean }> {
    if (site) {
      return { site, created: false };
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !user) {
      throw new Error("You must be signed in.");
    }
    if (!businessName.trim() || !slug.trim()) {
      throw new Error("Business name and slug are required to create a draft.");
    }
    const created = await createOwnerSite(supabase, user.id, {
      businessName: businessName.trim(),
      slug: slug.trim(),
      style: inspiration.style,
    });
    setSite(created);
    setSites((current) => [created, ...current.filter((row) => row.id !== created.id)]);
    return { site: created, created: true };
  }

  async function onContinueFromBusiness(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    try {
      const result = await ensureDraftSite();
      setStatus(
        result.created
          ? `Draft created for “${result.site.business_name}” · /site/${result.site.slug}`
          : `Draft ready for “${result.site.business_name}” · /site/${result.site.slug}`,
      );
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
    }
  }

  async function onDeleteMedia(row: MediaRow) {
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
      if (site) {
        await refreshMedia(site.id);
      }
      setEditConfig((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          sections: current.sections.map((section) => {
            if (!section.mediaIds?.includes(row.id)) {
              return section;
            }
            const nextIds = section.mediaIds.filter((id) => id !== row.id);
            return {
              ...section,
              mediaIds: nextIds.length > 0 ? nextIds : undefined,
            };
          }),
        };
      });
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

    try {
      const { site: draft } = await ensureDraftSite();
      if (!file) {
        setError("Choose a file to upload.");
        return;
      }
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }
      setUploading(true);
      const { media: row } = await uploadSiteMedia(supabase, {
        siteId: draft.id,
        file,
        description: mediaDescription,
      });
      setFile(null);
      setMediaDescription("");
      setStatus(`Uploaded ${row.description || "media"}.`);
      await refreshMedia(draft.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onGenerate() {
    setError(null);
    setStatus(null);

    if (selectedSections.length < 2) {
      setError("Choose at least a few sections for the page.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase || !user) {
      setError("You must be signed in.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.refreshSession();
    const token = session?.access_token;
    if (sessionError || !token) {
      setError("Your session expired. Sign in again.");
      router.replace("/owner/login");
      return;
    }

    setGenerating(true);
    try {
      const { site: draft } = await ensureDraftSite();
      const result = await generateSiteConfig(token, {
        businessName: businessName.trim() || draft.business_name,
        businessType: businessType.trim() || undefined,
        description: description.trim() || undefined,
        services: services.length ? services : undefined,
        style: inspiration.style,
        inspirationHint: [
          inspiration.hint,
          `Owner brand colors (${normalizedBrandColors.length}): ${normalizedBrandColors.join(", ")}.`,
        ].join(" "),
        sections: selectedSections,
        contact: {
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          hours: hours.trim() || undefined,
        },
        media: media.map((row) => ({
          id: row.id,
          description: row.description,
          kind: row.type,
        })),
        slug: draft.slug,
        persist: false,
      });

      const themedConfig = withThemeColors(result.config, normalizedBrandColors);
      const updated = await updateOwnerSiteConfig(
        supabase,
        draft.id,
        themedConfig,
        inspiration.style,
      );
      setSite(updated);
      setSites((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
      setEditConfig(themedConfig);
      setSelectedSectionId(themedConfig.sections[0]?.id ?? null);
      setGenerated(true);
      setStatus(
        `Generated ${result.sectionCount} sections (${result.sectionTypes.join(", ")}). Edit copy and photos below.`,
      );
      setStep(5);
    } catch (err) {
      if (err instanceof BackendApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Generation failed.");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function onSaveSection(nextSection: SiteSection) {
    if (!site || !editConfig) {
      setError("No draft config to update.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSavingSection(true);
    setError(null);
    setStatus(null);
    try {
      const nextConfig = replaceSectionInConfig(editConfig, nextSection);
      const validated = await validateSiteConfig(nextConfig);
      const updated = await updateOwnerSiteConfig(
        supabase,
        site.id,
        validated.config,
      );
      setSite(updated);
      setEditConfig(validated.config);
      setStatus(`Saved ${sectionLabel(nextSection)}.`);
    } catch (err) {
      if (err instanceof BackendApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Could not save section.");
      }
    } finally {
      setSavingSection(false);
    }
  }

  function onBrandCountChange(count: BrandColorCount) {
    setBrandColorCount(count);
    setBrandColors((current) => normalizeBrandColors(count, current));
  }

  function onBrandColorChange(index: number, color: string) {
    setBrandColors((current) => {
      const next = [...current];
      next[index] = color;
      return next;
    });
  }

  async function onPublish() {
    setError(null);
    setStatus(null);
    if (!site) {
      setError("No site to publish.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setPublishing(true);
    try {
      const published = await publishOwnerSite(supabase, site.id);
      setSite(published);
      setSites((current) =>
        current.map((row) => (row.id === published.id ? published : row)),
      );
      setStatus(`Published at /site/${published.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function onSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase?.auth.signOut();
    router.push("/owner/login");
  }

  if (loading) {
    return (
      <main className="owner-shell">
        <p className="text-sm owner-muted-text">Loading workspace…</p>
      </main>
    );
  }

  return (
    <main className="owner-shell">
      <div className="relative mx-auto max-w-5xl">
        <OwnerTopBar active="create" onSignOut={() => void onSignOut()} />

        <section className="owner-panel mt-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-[16rem] flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
              Your websites · {sites.length}
            </p>
            <label className="owner-label mt-3">
              Active site
              <select
                className="owner-input mt-2"
                value={site?.id ?? ""}
                onChange={(event) => {
                  const next = sites.find((row) => row.id === event.target.value);
                  if (next) {
                    void loadSiteIntoWizard(next);
                    setStatus(
                      `Switched to “${next.business_name}” (/site/${next.slug}).`,
                    );
                  }
                }}
              >
                {!site ? (
                  <option value="">New website (unsaved)</option>
                ) : null}
                {sites.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.business_name} · /{row.slug} · {row.status}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={startNewWebsite}
            className="owner-btn-primary"
          >
            New website
          </button>
        </section>

        <header className="mt-10 max-w-2xl">
          <h1 className="owner-heading text-4xl tracking-tight sm:text-5xl">
            {site ? "Edit your website" : "Create your website"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed owner-muted-text">
            Save a draft, generate the site, then edit each section&apos;s copy and
            photos before you publish. Use New website for another business.
          </p>
          {site ? (
            <p className="owner-alert-ok mt-4 inline-block text-sm">
              Active: {site.business_name} · /site/{site.slug} · {site.status}
            </p>
          ) : (
            <p className="mt-4 text-sm owner-muted-text">
              No draft selected yet — fill step 1 and save to create one.
            </p>
          )}
        </header>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Wizard steps">
          {STEPS.map((item) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setStep(item.id);
                  if (item.id === 5 && editConfig && !selectedSectionId) {
                    setSelectedSectionId(editConfig.sections[0]?.id ?? null);
                  }
                }}
                className={`owner-step ${
                  active ? "owner-step-active" : done ? "owner-step-done" : ""
                }`}
              >
                {item.id}. {item.label}
              </button>
            );
          })}
        </nav>

        {step === 1 ? (
          <form
            onSubmit={onContinueFromBusiness}
            className="mt-10 grid gap-6 lg:grid-cols-2"
          >
            <section className="owner-panel space-y-5">
              <h2 className="owner-heading text-2xl">
                Business brief
              </h2>
              <Field label="Business name">
                <input
                  required
                  value={businessName}
                  onChange={(event) => {
                    const next = event.target.value;
                    setBusinessName(next);
                    if (!slugTouched) {
                      setSlug(slugify(next));
                    }
                  }}
                  className="owner-input"
                />
              </Field>
              <Field
                label="Public slug"
                hint={`Live URL after publish: /site/${slug || "your-slug"}`}
              >
                <input
                  required
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  className="owner-input"
                />
              </Field>
              <Field label="Business type">
                <input
                  value={businessType}
                  onChange={(event) => setBusinessType(event.target.value)}
                  placeholder="Cafe, salon, fitness studio…"
                  className="owner-input"
                />
              </Field>
              <Field label="What should the site say?">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="owner-input resize-y"
                />
              </Field>
              <Field label="Services (one per line)">
                <textarea
                  value={servicesText}
                  onChange={(event) => setServicesText(event.target.value)}
                  rows={4}
                  className="owner-input resize-y"
                />
              </Field>
            </section>

            <section className="owner-panel space-y-5">
              <h2 className="owner-heading text-2xl">
                Contact
              </h2>
              <Field label="Address">
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="owner-input"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="owner-input"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="owner-input"
                />
              </Field>
              <Field label="Hours">
                <input
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                  className="owner-input"
                />
              </Field>
              <button type="submit" className="owner-btn-primary mt-4 w-full sm:w-auto">
                {site ? "Continue to look & sections" : "Save draft & continue"}
              </button>
            </section>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="mt-10 space-y-12">
            <section>
              <div className="mb-6 max-w-2xl">
                <h2 className="owner-heading text-2xl">
                  Design direction
                </h2>
                <p className="mt-2 text-sm owner-muted-text">
                  Pick a visual direction. This sets the design style and guides
                  copy tone — not a final template lock.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {INSPIRATION_OPTIONS.map((option) => {
                  const selected = option.id === inspirationId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setInspirationId(option.id)}
                      className={`owner-choice overflow-hidden ${
                        selected ? "owner-choice-selected" : ""
                      }`}
                    >
                      <div
                        className="aspect-[16/10]"
                        style={{ background: option.swatch }}
                      />
                      <div className="border-t border-[#e2e8f0] p-4">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                          style={{ color: option.accent }}
                        >
                          {option.style}
                        </p>
                        <p className="owner-heading mt-1 text-xl">
                          {option.title}
                        </p>
                        <p className="mt-1 text-xs owner-muted-text">{option.blurb}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-6 max-w-2xl">
                <h2 className="owner-heading text-2xl">Brand colors</h2>
                <p className="mt-2 text-sm owner-muted-text">
                  What colors should the site use? Pick one, two, or three — any
                  hex you want. We apply them as the site theme after generate.
                </p>
              </div>
              <BrandColorPicker
                count={brandColorCount}
                colors={brandColors}
                onCountChange={onBrandCountChange}
                onColorChange={onBrandColorChange}
              />
            </section>

            <section>
              <div className="mb-6 max-w-2xl">
                <h2 className="owner-heading text-2xl">
                  Page sections
                </h2>
                <p className="mt-2 text-sm owner-muted-text">
                  Choose what appears on the one-page site. Hero and footer stay
                  on so every site has a clear open and close.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SECTION_OPTIONS.map((option) => {
                  const selected = selectedSections.includes(option.type);
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => toggleSection(option.type, option.required)}
                      className={`owner-choice px-4 py-4 ${
                        selected ? "owner-choice-selected" : ""
                      } ${option.required ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                          {option.label}
                        </p>
                        <span
                          className={`mt-0.5 h-4 w-4 shrink-0 border ${
                            selected
                              ? "border-[#0f766e] bg-[#0f766e]"
                              : "border-[#cbd5e1]"
                          }`}
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed owner-muted-text">
                        {option.description}
                        {option.required ? " · Required" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="owner-btn-ghost"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="owner-btn-primary"
                >
                  Continue to media
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {step === 3 ? (
          <section className="mt-10 max-w-2xl space-y-6">
            <div>
              <h2 className="owner-heading text-2xl">
                Photos & video
              </h2>
              <p className="mt-2 text-sm owner-muted-text">
                Upload images for the hero and gallery. These become media IDs
                the generator can place into sections.
              </p>
            </div>
            <form onSubmit={onUpload} className="owner-panel space-y-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm owner-muted-text"
              />
              <Field label="Description / alt text">
                <input
                  value={mediaDescription}
                  onChange={(event) => setMediaDescription(event.target.value)}
                  className="owner-input"
                />
              </Field>
              <button
                type="submit"
                disabled={uploading}
                className="owner-btn-primary"
              >
                {uploading ? "Uploading…" : "Upload media"}
              </button>
            </form>

            <ul className="space-y-3">
              {media.map((row) => {
                const asset = assets[row.id];
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-4 border border-[#e2e8f0] bg-white p-3"
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
                      <p className="truncate text-[#0f766e]">{row.description || row.id}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{row.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onDeleteMedia(row)}
                      disabled={deletingId === row.id}
                      className="shrink-0 text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
                    >
                      {deletingId === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep(2)} className="owner-btn-ghost">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="owner-btn-primary">
                Continue to generate
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="owner-panel space-y-6">
              <div>
                <h2 className="owner-heading text-2xl">
                  Generate
                </h2>
                <p className="mt-2 text-sm owner-muted-text">
                  Gemini builds structured page config from your brief, selected
                  sections, look, and media — then we validate before saving.
                </p>
              </div>

              <dl className="grid gap-3 border border-[#e2e8f0] bg-[#f8fafc] p-5 text-sm">
                <SummaryRow label="Business" value={businessName || "—"} />
                <SummaryRow label="Look" value={inspiration.title} />
                <SummaryRow
                  label="Colors"
                  value={brandColorsLabel(normalizedBrandColors)}
                />
                <SummaryRow
                  label="Sections"
                  value={selectedSections.join(", ")}
                />
                <SummaryRow
                  label="Media"
                  value={
                    media.length
                      ? `${media.length} file${media.length === 1 ? "" : "s"}`
                      : "None uploaded"
                  }
                />
              </dl>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep(3)} className="owner-btn-ghost">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void onGenerate()}
                  disabled={generating}
                  className="owner-btn-primary"
                >
                  {generating ? "Generating…" : "Generate website"}
                </button>
              </div>

              {generated && site ? (
                <div className="owner-alert-ok">
                  <p className="font-medium">Draft ready</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="owner-btn-primary !py-2"
                    >
                      Edit sections & photos
                    </button>
                    <Link
                      href={`/owner/sites/${site.slug}/preview`}
                      className="owner-btn-ghost !py-2"
                    >
                      Full preview
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="owner-choice overflow-hidden">
              <div
                className="h-28"
                style={{ background: inspiration.swatch }}
              />
              <div className="flex h-12">
                {brandColors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1"
                    style={{ backgroundColor: normalizeHexColor(color, "#111111") }}
                  />
                ))}
              </div>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
                  Selected look
                </p>
                <p className="owner-heading mt-2 text-2xl">
                  {inspiration.title}
                </p>
                <p className="mt-2 text-xs owner-muted-text">{inspiration.blurb}</p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#64748b]">
                  Colors
                </p>
                <p className="mt-1 font-mono text-xs text-slate-900">
                  {brandColors.join(" · ")}
                </p>
                <p className="mt-1 text-[11px] owner-muted-text">
                  Theme uses {themeFromBrand.primaryColor} /{" "}
                  {themeFromBrand.accentColor}
                </p>
              </div>
            </aside>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="mt-10 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="owner-heading text-2xl">Edit sections</h2>
                <p className="mt-2 text-sm owner-muted-text">
                  Change copy, variants, and which photos appear on each section.
                  Saves to your draft after validation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep(4)} className="owner-btn-ghost">
                  Back
                </button>
                {site ? (
                  <Link
                    href={`/owner/sites/${site.slug}/preview`}
                    className="owner-btn-ghost"
                  >
                    Full preview
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void onPublish()}
                  disabled={!site || publishing || site.status === "published"}
                  className="owner-btn-primary"
                >
                  {!site
                    ? "Publish"
                    : site.status === "published"
                      ? "Published"
                      : publishing
                        ? "Publishing…"
                        : "Publish"}
                </button>
              </div>
            </div>

            {!editConfig ? (
              <div className="owner-panel space-y-4">
                <p className="text-sm owner-muted-text">
                  Generate a site first, then you can edit each section here.
                </p>
                <button type="button" onClick={() => setStep(4)} className="owner-btn-primary">
                  Go to generate
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto">
                  {editConfig.sections.map((section) => {
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
                        className={`shrink-0 border px-3 py-2 text-left text-sm transition ${
                          active
                            ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]"
                            : "border-[#e2e8f0] bg-white text-slate-700"
                        }`}
                      >
                        <span className="block font-medium capitalize">
                          {section.type}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {section.id}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs owner-muted-text">
                  Full-width preview. Click a section chip to open the editor
                  drawer — Save section to persist.
                </p>

                <div className="-mx-6 overflow-hidden border-y border-[#e2e8f0] sm:-mx-8">
                  <SiteRenderer config={editConfig} mediaById={assets} />
                </div>

                {selectedSectionId &&
                editConfig.sections.find((s) => s.id === selectedSectionId) ? (
                  <>
                    <button
                      type="button"
                      aria-label="Close editor"
                      className="fixed inset-0 z-40 bg-black/40"
                      onClick={() => setSelectedSectionId(null)}
                    />
                    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#e2e8f0] bg-white shadow-2xl">
                      <SectionEditor
                        key={selectedSectionId}
                        section={
                          editConfig.sections.find(
                            (s) => s.id === selectedSectionId,
                          )!
                        }
                        mediaById={assets}
                        saving={savingSection}
                        onCancel={() => setSelectedSectionId(null)}
                        onDraftChange={(nextSection) => {
                          try {
                            setEditConfig(
                              replaceSectionInConfig(editConfig, nextSection),
                            );
                          } catch {
                            // ignore
                          }
                        }}
                        onSave={onSaveSection}
                      />
                    </aside>
                  </>
                ) : null}
              </div>
            )}

            {site?.status === "published" ? (
              <p className="text-sm">
                <Link
                  href={`/site/${site.slug}`}
                  className="owner-link text-[#0f766e]"
                >
                  Open public site
                </Link>
              </p>
            ) : null}
          </section>
        ) : null}

        {error ? <p className="owner-alert-error mt-8">{error}</p> : null}
        {status ? <p className="owner-alert-ok mt-8">{status}</p> : null}
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="owner-label">
      {label}
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-[#64748b]">{hint}</span> : null}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <dt className="text-[#64748b]">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}
