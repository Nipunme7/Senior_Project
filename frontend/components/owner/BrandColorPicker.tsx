"use client";

import {
  palettesForStyle,
  type BrandColorCount,
  type StyleColorPalette,
} from "@/lib/owner/wizard-options";
import type { DesignStyle } from "@/lib/types/website-config";

const COUNT_OPTIONS: { count: BrandColorCount; label: string }[] = [
  { count: 1, label: "One" },
  { count: 2, label: "Two" },
  { count: 3, label: "Three" },
];

const SLOT_LABELS = ["Background", "Ink", "Accent"] as const;

export type ColorMode = "palette" | "custom";

interface BrandColorPickerProps {
  style: DesignStyle;
  mode: ColorMode;
  paletteId: string;
  count: BrandColorCount;
  colors: string[];
  onModeChange: (mode: ColorMode) => void;
  onPaletteChange: (palette: StyleColorPalette) => void;
  onCountChange: (count: BrandColorCount) => void;
  onColorChange: (index: number, color: string) => void;
}

export function BrandColorPicker({
  style,
  mode,
  paletteId,
  count,
  colors,
  onModeChange,
  onPaletteChange,
  onCountChange,
  onColorChange,
}: BrandColorPickerProps) {
  const palettes = palettesForStyle(style);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onModeChange("palette")}
          className={`border px-4 py-2 text-sm transition ${
            mode === "palette"
              ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]"
              : "border-[#e2e8f0] bg-white text-slate-700 hover:border-[#cbd5e1]"
          }`}
        >
          Style templates
        </button>
        <button
          type="button"
          onClick={() => onModeChange("custom")}
          className={`border px-4 py-2 text-sm transition ${
            mode === "custom"
              ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]"
              : "border-[#e2e8f0] bg-white text-slate-700 hover:border-[#cbd5e1]"
          }`}
        >
          Custom colors
        </button>
      </div>

      {mode === "palette" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {palettes.map((palette) => {
            const selected = palette.id === paletteId;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => onPaletteChange(palette)}
                className={`owner-choice overflow-hidden p-0 text-left ${
                  selected ? "owner-choice-selected" : ""
                }`}
              >
                <div className="flex h-14">
                  {palette.colors.map((color) => (
                    <div
                      key={color}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="border-t border-[#e2e8f0] px-3 py-3">
                  <p className="text-sm font-medium text-[#0f172a]">
                    {palette.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] tracking-wide text-[#94a3b8]">
                    {palette.colors.join(" · ")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map((option) => {
              const selected = option.count === count;
              return (
                <button
                  key={option.count}
                  type="button"
                  onClick={() => onCountChange(option.count)}
                  className={`border px-4 py-2 text-sm transition ${
                    selected
                      ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]"
                      : "border-[#e2e8f0] bg-white text-slate-700 hover:border-[#cbd5e1]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: count }, (_, index) => {
              const value = colors[index] ?? "#111111";
              return (
                <label
                  key={index}
                  className="owner-choice flex cursor-pointer items-center gap-3 px-3 py-3"
                >
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#111111"}
                    onChange={(event) => onColorChange(index, event.target.value)}
                    className="h-12 w-12 shrink-0 cursor-pointer border border-[#e2e8f0] bg-white p-1"
                    aria-label={`${SLOT_LABELS[index]} color`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {SLOT_LABELS[index]}
                    </span>
                    <input
                      type="text"
                      value={value}
                      onChange={(event) => onColorChange(index, event.target.value)}
                      spellCheck={false}
                      className="mt-1 w-full border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-wide text-[#64748b] outline-none focus:text-slate-900"
                      aria-label={`${SLOT_LABELS[index]} hex`}
                    />
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
