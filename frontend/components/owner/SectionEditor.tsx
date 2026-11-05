"use client";

import { useState, type ReactNode } from "react";
import {
  MEDIA_SECTION_TYPES,
  VARIANTS_BY_TYPE,
  sectionLabel,
  toggleMediaId,
} from "@/lib/sites/section-edit";
import type {
  MediaAsset,
  SiteSection,
  TestimonialItem,
} from "@/lib/types/website-config";

interface SectionEditorProps {
  section: SiteSection;
  mediaById: Record<string, MediaAsset>;
  saving?: boolean;
  onCancel: () => void;
  onSave: (section: SiteSection) => void | Promise<void>;
  /** Fires on every local edit so the live preview can update immediately. */
  onDraftChange?: (section: SiteSection) => void;
}

/**
 * Local draft state is initialized from `section`.
 * Parents remount this editor with `key={section.id}` when switching sections.
 */
export function SectionEditor({
  section,
  mediaById,
  saving = false,
  onCancel,
  onSave,
  onDraftChange,
}: SectionEditorProps) {
  const [draft, setDraft] = useState<SiteSection>(section);

  const variants = VARIANTS_BY_TYPE[draft.type];
  const showMedia = MEDIA_SECTION_TYPES.has(draft.type);
  const multiMedia = draft.type === "gallery";
  const mediaIds = Object.keys(mediaById);

  function commitDraft(next: SiteSection) {
    setDraft(next);
    onDraftChange?.(next);
  }

  function updateProps(patch: Record<string, unknown>) {
    commitDraft({
      ...draft,
      props: { ...draft.props, ...patch },
    } as SiteSection);
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-[#e2e8f0] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
          Edit section
        </p>
        <h2 className="owner-heading mt-1 text-xl">{sectionLabel(draft)}</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <label className="owner-label">
          Variant
          <select
            value={draft.variant}
            onChange={(event) =>
              commitDraft({
                ...draft,
                variant: event.target.value,
              } as SiteSection)
            }
            className="owner-input mt-2"
          >
            {variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </label>

        <PropFields section={draft} onChangeProps={updateProps} onReplace={commitDraft} />

        {showMedia ? (
          <div>
            <p className="owner-label">
              Images {multiMedia ? "(multiple)" : "(one)"}
            </p>
            {mediaIds.length === 0 ? (
              <p className="mt-2 text-sm owner-muted-text">
                No media uploaded for this site yet. Add files in Media or the
                builder.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {mediaIds.map((id) => {
                  const asset = mediaById[id];
                  const selected = (draft.mediaIds ?? []).includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() =>
                          commitDraft({
                            ...draft,
                            mediaIds: toggleMediaId(draft.mediaIds, id, {
                              multi: multiMedia,
                            }),
                          })
                        }
                        className={`owner-choice w-full overflow-hidden p-0 ${
                          selected ? "owner-choice-selected" : ""
                        }`}
                      >
                        {asset?.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.alt || id}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                            Video
                          </div>
                        )}
                        <p className="truncate px-2 py-1.5 text-left text-[11px] text-slate-600">
                          {asset?.alt || id.slice(0, 8)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 border-t border-[#e2e8f0] px-4 py-3">
        <button type="button" onClick={onCancel} className="owner-btn-ghost flex-1 !py-2">
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave(draft)}
          className="owner-btn-primary flex-1 !py-2"
        >
          {saving ? "Saving…" : "Save section"}
        </button>
      </div>
    </div>
  );
}

function PropFields({
  section,
  onChangeProps,
  onReplace,
}: {
  section: SiteSection;
  onChangeProps: (patch: Record<string, unknown>) => void;
  onReplace: (section: SiteSection) => void;
}) {
  switch (section.type) {
    case "hero":
      return (
        <>
          <TextField
            label="Headline"
            value={section.props.headline}
            onChange={(value) => onChangeProps({ headline: value })}
          />
          <TextField
            label="Subheadline"
            value={section.props.subheadline ?? ""}
            onChange={(value) => onChangeProps({ subheadline: value })}
          />
          <TextField
            label="CTA label"
            value={section.props.ctaLabel ?? ""}
            onChange={(value) => onChangeProps({ ctaLabel: value })}
          />
          <TextField
            label="CTA link"
            value={section.props.ctaHref ?? ""}
            onChange={(value) => onChangeProps({ ctaHref: value })}
          />
        </>
      );
    case "about":
      return (
        <>
          <TextField
            label="Heading"
            value={section.props.heading ?? ""}
            onChange={(value) => onChangeProps({ heading: value })}
          />
          <TextAreaField
            label="Body"
            value={section.props.body}
            onChange={(value) => onChangeProps({ body: value })}
          />
        </>
      );
    case "services":
      return (
        <ItemsEditor
          heading={section.props.heading ?? ""}
          onHeading={(heading) => onChangeProps({ heading })}
          items={section.props.items}
          onItems={(items) => onChangeProps({ items })}
          blankItem={{ name: "", description: "" }}
          renderItem={(item, index, update) => (
            <>
              <TextField
                label={`Service ${index + 1} name`}
                value={item.name}
                onChange={(name) => update({ ...item, name })}
              />
              <TextField
                label="Description"
                value={item.description ?? ""}
                onChange={(description) => update({ ...item, description })}
              />
            </>
          )}
        />
      );
    case "pricing":
      return (
        <ItemsEditor
          heading={section.props.heading ?? ""}
          onHeading={(heading) => onChangeProps({ heading })}
          items={section.props.items}
          onItems={(items) => onChangeProps({ items })}
          blankItem={{ name: "", price: "", description: "" }}
          renderItem={(item, index, update) => (
            <>
              <TextField
                label={`Package ${index + 1}`}
                value={item.name}
                onChange={(name) => update({ ...item, name })}
              />
              <TextField
                label="Price"
                value={item.price}
                onChange={(price) => update({ ...item, price })}
              />
              <TextField
                label="Description"
                value={item.description ?? ""}
                onChange={(description) => update({ ...item, description })}
              />
            </>
          )}
        />
      );
    case "gallery":
      return (
        <TextField
          label="Heading"
          value={section.props.heading ?? ""}
          onChange={(value) => onChangeProps({ heading: value })}
        />
      );
    case "testimonials":
      return (
        <ItemsEditor
          heading={section.props.heading ?? ""}
          onHeading={(heading) => onChangeProps({ heading })}
          items={section.props.items}
          onItems={(items) => onChangeProps({ items })}
          blankItem={{ quote: "", name: "", role: "" } satisfies TestimonialItem}
          renderItem={(item, index, update) => (
            <>
              <TextAreaField
                label={`Quote ${index + 1}`}
                value={item.quote}
                onChange={(quote) => update({ ...item, quote })}
              />
              <TextField
                label="Name"
                value={item.name}
                onChange={(name) => update({ ...item, name })}
              />
              <TextField
                label="Role"
                value={item.role ?? ""}
                onChange={(role) => update({ ...item, role })}
              />
            </>
          )}
        />
      );
    case "cta":
      return (
        <>
          <TextField
            label="Heading"
            value={section.props.heading}
            onChange={(value) => onChangeProps({ heading: value })}
          />
          <TextAreaField
            label="Body"
            value={section.props.body ?? ""}
            onChange={(value) => onChangeProps({ body: value })}
          />
          <TextField
            label="CTA label"
            value={section.props.ctaLabel ?? ""}
            onChange={(value) => onChangeProps({ ctaLabel: value })}
          />
          <TextField
            label="CTA link"
            value={section.props.ctaHref ?? ""}
            onChange={(value) => onChangeProps({ ctaHref: value })}
          />
        </>
      );
    case "contact":
      return (
        <>
          <TextField
            label="Heading"
            value={section.props.heading ?? ""}
            onChange={(value) => onChangeProps({ heading: value })}
          />
          <TextField
            label="Address"
            value={section.props.address ?? ""}
            onChange={(value) => onChangeProps({ address: value })}
          />
          <TextField
            label="Phone"
            value={section.props.phone ?? ""}
            onChange={(value) => onChangeProps({ phone: value })}
          />
          <TextField
            label="Email"
            value={section.props.email ?? ""}
            onChange={(value) => onChangeProps({ email: value })}
          />
          <TextField
            label="Hours"
            value={section.props.hours ?? ""}
            onChange={(value) => onChangeProps({ hours: value })}
          />
        </>
      );
    case "footer":
      return (
        <>
          <TextField
            label="Tagline"
            value={section.props.tagline ?? ""}
            onChange={(value) => onChangeProps({ tagline: value })}
          />
          <TextField
            label="Copyright"
            value={section.props.copyright ?? ""}
            onChange={(value) => onChangeProps({ copyright: value })}
          />
        </>
      );
    default:
      void onReplace;
      return null;
  }
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="owner-label">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="owner-input mt-2"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="owner-label">
      {label}
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="owner-input mt-2 resize-y"
      />
    </label>
  );
}

function ItemsEditor<T extends object>({
  heading,
  onHeading,
  items,
  onItems,
  blankItem,
  renderItem,
}: {
  heading: string;
  onHeading: (heading: string) => void;
  items: T[];
  onItems: (items: T[]) => void;
  blankItem: T;
  renderItem: (
    item: T,
    index: number,
    update: (next: T) => void,
  ) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      <TextField label="Section heading" value={heading} onChange={onHeading} />
      {items.map((item, index) => (
        <div key={index} className="space-y-3 border border-[#e2e8f0] p-3">
          {renderItem(item, index, (next) => {
            const copy = items.slice();
            copy[index] = next;
            onItems(copy);
          })}
          <button
            type="button"
            className="text-xs text-red-700 underline underline-offset-2"
            onClick={() => onItems(items.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="owner-btn-ghost !py-2"
        onClick={() => onItems([...items, blankItem])}
      >
        Add item
      </button>
    </div>
  );
}
