import type { FooterSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";

export function FooterSection({
  id,
  props,
  theme,
}: SectionComponentProps<FooterSectionConfig>) {
  const year = new Date().getFullYear();

  return (
    <footer id={id} className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--site-accent)]">
          {theme.style}
        </p>
        {props.tagline ? (
          <p className="font-[family-name:var(--font-display)] text-xl text-[#f7f3ea]">
            {props.tagline}
          </p>
        ) : null}
        <p className="text-xs text-[#9d978b]">
          {props.copyright ?? `© ${year}`}
        </p>
      </div>
    </footer>
  );
}
