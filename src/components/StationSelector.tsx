"use client";

import { useEffect, useRef } from "react";
import { STATIONS, type Station } from "@/data/stations";

/** Tiny original glyph per station — abstract, never film IP. */
function StationGlyph({ station }: { station: Station }) {
  const c = station.accentColor;
  const common = { fill: "none", stroke: c, strokeWidth: 1.6 } as const;
  switch (station.backgroundVariant) {
    case "deep-space":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <circle cx="16" cy="16" r="10" {...common} />
          <circle cx="16" cy="16" r="3" fill={c} stroke="none" />
          <line x1="16" y1="6" x2="16" y2="13" {...common} strokeWidth="1" />
          <line x1="16" y1="19" x2="16" y2="26" {...common} strokeWidth="1" />
        </svg>
      );
    case "dawn-sea":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <line x1="4" y1="14" x2="28" y2="14" {...common} />
          <path d="M6 20 Q10 17 14 20 T22 20 T30 20" {...common} strokeWidth="1.2" />
          <path d="M4 26 Q8 23 12 26 T20 26 T28 26" {...common} strokeWidth="1.2" />
        </svg>
      );
    case "desert-night":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <path d="M4 24 L10 24 L13 18 L19 18 L22 24 L28 24" {...common} />
          <circle cx="16" cy="10" r="2.4" fill={c} stroke="none" opacity="0.9" />
        </svg>
      );
    case "inverted-city":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <path d="M6 6 L6 14 M11 6 L11 18 M16 6 L16 12 M21 6 L21 16 M26 6 L26 13" {...common} />
          <line x1="4" y1="22" x2="28" y2="22" {...common} strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case "dream-limbo":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <path d="M4 24 C12 24 12 8 20 8 C26 8 28 14 28 24" {...common} />
          <path d="M10 24 L10 18 M15 24 L15 15 M20 24 L20 13" {...common} strokeWidth="1" />
        </svg>
      );
    case "wine-dark-sea":
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <path d="M6 20 Q11 16 16 20 T26 20" {...common} />
          <path d="M16 8 L16 16 M16 8 Q21 10 16 13" {...common} strokeWidth="1.2" />
          <circle cx="8" cy="8" r="0.9" fill={c} stroke="none" />
          <circle cx="24" cy="6" r="0.9" fill={c} stroke="none" />
        </svg>
      );
  }
}

export function StationCard({
  station,
  active,
  onSelect,
  autoFocus,
}: {
  station: Station;
  active: boolean;
  onSelect: () => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={`group flex min-h-[64px] w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-[#e8dcc3]/35 bg-[#e8dcc3]/8"
          : "border-[#e8dcc3]/8 hover:border-[#e8dcc3]/22 hover:bg-[#e8dcc3]/4"
      }`}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border"
        style={{
          borderColor: `${station.accentColor}44`,
          background: `${station.accentColor}12`,
        }}
      >
        <StationGlyph station={station} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold tracking-[0.14em] text-[#e8e2d4]">
            {station.name}
          </span>
          <span className="font-mono-tars shrink-0 text-[9px] tracking-[0.14em] text-[#8a8172]">
            {station.film.toUpperCase()}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#a8a08e]">
          {station.description}
        </span>
      </span>
      {active && (
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: station.accentColor,
              boxShadow: `0 0 8px ${station.accentColor}`,
            }}
          />
          <span className="font-mono-tars text-[8px] tracking-[0.2em] text-[#a8a08e]">
            ON AIR
          </span>
        </span>
      )}
    </button>
  );
}

export function StationSelector({
  open,
  activeId,
  onSelect,
  onClose,
}: {
  open: boolean;
  activeId: string;
  onSelect: (station: Station) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(
          panelRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []
        );
        const idx = items.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          e.key === "ArrowDown"
            ? items[(idx + 1) % items.length]
            : items[(idx - 1 + items.length) % items.length];
        next?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  /* NOTE: the dim/blur backdrop is rendered by TarsApp, outside this
     component — an ancestor here carries a transform, which would capture
     a fixed-position backdrop and collapse it to nothing. */
  return (
    <>
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Choose a station"
        className={[
          "tars-glass z-50 flex flex-col gap-1.5 p-2.5",
          // desktop: popover above the player
          "md:absolute md:bottom-[calc(100%+14px)] md:left-1/2 md:w-[420px] md:-translate-x-1/2 md:rounded-2xl",
          // mobile: bottom sheet
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[72dvh] max-md:overflow-y-auto max-md:rounded-t-2xl max-md:pb-[max(1rem,env(safe-area-inset-bottom))]",
        ].join(" ")}
        style={{ animation: "tars-sheet-up 0.32s cubic-bezier(0.2,0.8,0.2,1)" }}
      >
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="font-mono-tars text-[9px] tracking-[0.3em] text-[#8a8172]">
            STATIONS
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close station selector"
            className="grid h-8 w-8 place-items-center rounded-full text-[#8a8172] hover:text-[#e8e2d4]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M3 3 L13 13 M13 3 L3 13" />
            </svg>
          </button>
        </div>
        {STATIONS.map((s, i) => (
          <StationCard
            key={s.id}
            station={s}
            active={s.id === activeId}
            autoFocus={i === 0}
            onSelect={() => {
              onSelect(s);
              onClose();
            }}
          />
        ))}
      </div>
    </>
  );
}
