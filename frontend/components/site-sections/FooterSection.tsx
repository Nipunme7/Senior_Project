import type { FooterSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";

export function FooterSection({
  id,
  props,
}: SectionComponentProps<FooterSectionConfig>) {
  const year = new Date().getFullYear();

  return (
    <footer id={id} className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
        {props.tagline ? (
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--site-secondary)]">
            {props.tagline}
          </p>
        ) : null}
        <p className="text-xs text-[var(--site-secondary)]/55">
          {props.copyright ?? `© ${year}`}
        </p>
      </div>
    </footer>
  );
}
