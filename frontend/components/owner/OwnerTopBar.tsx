import Link from "next/link";
import type { ReactNode } from "react";

interface OwnerTopBarProps {
  active?: "create" | "media" | "preview" | "login";
  onSignOut?: () => void;
  rightSlot?: ReactNode;
}

const NAV = [
  { href: "/owner/create", key: "create" as const, label: "Builder" },
  { href: "/owner/media", key: "media" as const, label: "Media" },
];

export function OwnerTopBar({ active, onSignOut, rightSlot }: OwnerTopBarProps) {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
      <div className="flex flex-wrap items-center gap-6">
        <Link href="/" className="group">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
            SiteCraft
          </span>
          <span className="owner-heading mt-1 block text-xl transition group-hover:!text-[#0f766e]">
            Website builder
          </span>
        </Link>
        {active !== "login" ? (
          <nav className="flex flex-wrap gap-1" aria-label="Owner navigation">
            {NAV.map((item) => {
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                    isActive
                      ? "text-[#0f766e]"
                      : "text-[#475569] hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {rightSlot}
        {onSignOut ? (
          <button
            type="button"
            onClick={onSignOut}
            className="text-sm owner-muted-text underline decoration-[#cbd5e1] underline-offset-4 hover:text-[#0f766e]"
          >
            Sign out
          </button>
        ) : null}
      </div>
    </div>
  );
}
