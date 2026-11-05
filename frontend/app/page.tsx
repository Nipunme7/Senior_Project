import Link from "next/link";
import { BuilderWireframe } from "@/components/owner/BuilderWireframe";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6f8] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.12),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(15,23,42,0.06),_transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
        <header className="flex items-center justify-between gap-4">
          <p className="owner-heading text-xl tracking-tight">
            SiteCraft
          </p>
          <Link
            href="/owner/login"
            className="text-sm font-medium text-[#475569] transition hover:text-[#0f766e]"
          >
            Sign in
          </Link>
        </header>

        <div className="mt-16 grid items-center gap-12 lg:mt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
              Website builder
            </p>
            <h1 className="owner-heading mt-4 max-w-xl text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              SiteCraft
            </h1>
            <p className="owner-body-text mt-5 max-w-md text-lg leading-snug">
              Build and publish a one-page site for your business — without
              writing code.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed owner-muted-text">
              Brief → look → sections → media → generate. AI fills approved
              building blocks; you preview and publish.
            </p>

            <div className="mt-9">
              <Link
                href="/owner/login"
                className="inline-flex items-center justify-center bg-[#0f172a] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0f766e]"
              >
                Get started
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                ["01", "Brief"],
                ["02", "Assemble"],
                ["03", "Publish"],
              ].map(([num, label]) => (
                <div key={num} className="border-t border-[#d7dde5] pt-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#475569]">
                    {num}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-[#99f6e4]/40 via-transparent to-[#cbd5e1]/50 blur-2xl" />
            <BuilderWireframe />
            <p className="mt-4 text-center text-xs font-medium text-[#475569]">
              Structured sections · shared renderer · one deploy for every site
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
