import type { ContactSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import { SectionHeading } from "@/components/site-sections/SectionHeading";

function ContactDetails({
  address,
  phone,
  email,
  hours,
}: {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
}) {
  return (
    <dl className="space-y-5 text-sm leading-relaxed text-[#cfc9bb]">
      {address ? (
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">Address</dt>
          <dd className="mt-2 whitespace-pre-line text-[#f7f3ea]">{address}</dd>
        </div>
      ) : null}
      {phone ? (
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">Phone</dt>
          <dd className="mt-2">
            <a href={`tel:${phone}`} className="text-[#f7f3ea]">
              {phone}
            </a>
          </dd>
        </div>
      ) : null}
      {email ? (
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">Email</dt>
          <dd className="mt-2">
            <a href={`mailto:${email}`} className="text-[#f7f3ea]">
              {email}
            </a>
          </dd>
        </div>
      ) : null}
      {hours ? (
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">Hours</dt>
          <dd className="mt-2 whitespace-pre-line text-[#f7f3ea]">{hours}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function ContactSection({
  id,
  variant,
  props,
}: SectionComponentProps<ContactSectionConfig>) {
  const heading = props.heading ?? "Contact";
  const details = (
    <ContactDetails
      address={props.address}
      phone={props.phone}
      email={props.email}
      hours={props.hours}
    />
  );

  if (variant === "map-right") {
    return (
      <section id={id} className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading kicker="Visit" heading={heading} />
        <div className="grid gap-8 md:grid-cols-2">
          {details}
          {props.mapEmbedUrl ? (
            <iframe
              title="Location map"
              src={props.mapEmbedUrl}
              className="min-h-[320px] w-full border-0 bg-white/5"
              loading="lazy"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center bg-white/5 text-sm text-[#cfc9bb]">
              Map unavailable
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section id={id} className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading kicker="Visit" heading={heading} />
        <div className="grid gap-12 md:grid-cols-2">
          {details}
          {props.email ? (
            <form action={`mailto:${props.email}`} method="post" encType="text/plain" className="space-y-4">
              <label className="block text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">
                Name
                <input
                  name="name"
                  className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-[#f7f3ea]"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.2em] text-[var(--site-accent)]">
                Message
                <textarea
                  name="message"
                  rows={5}
                  className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-[#f7f3ea]"
                />
              </label>
              <button
                type="submit"
                className="border border-[var(--site-accent)] px-6 py-3 text-xs uppercase tracking-[0.22em] text-[var(--site-accent)]"
              >
                Send
              </button>
            </form>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-xl px-6 py-24 text-center">
      <SectionHeading kicker="Visit" heading={heading} />
      <div className="text-left sm:text-center">
        <ContactDetails
          address={props.address}
          phone={props.phone}
          email={props.email}
          hours={props.hours}
        />
      </div>
    </section>
  );
}
