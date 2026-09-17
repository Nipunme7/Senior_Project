import Link from "next/link";
import { demoSitesBySlug } from "@/lib/demo/sites";

export default function Home() {
  const sites = Object.values(demoSitesBySlug);

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-24 text-[#f4f1ea]">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C9A45C]">
          Phase 1 demo
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
          One renderer. Two sites.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#cfc9bb]">
          Both routes below load different hard-coded WebsiteConfig objects and
          pass them through the same SiteRenderer.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <li key={site.slug}>
              <Link
                href={`/site/${site.slug}`}
                className="block border border-white/15 px-6 py-8 transition hover:border-[#C9A45C]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[#C9A45C]">
                  /site/{site.slug}
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-2xl">
                  {site.config.siteName}
                </p>
                <p className="mt-2 text-sm text-[#cfc9bb]">{site.config.theme.style}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
