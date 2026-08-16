"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "./Scene";

/**
 * Desktop: a small cork board hanging on the right bookshelf.
 * Mobile: the same contents in a bottom sheet behind a tappable chip —
 * there is no wall space on a phone, but the mission note is the reason
 * people keep this tab open, so it must stay reachable.
 */

function Pin({ color = "#8a4a3c" }: { color?: string }) {
  return (
    <span
      className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
      style={{ background: color }}
      aria-hidden
    />
  );
}

function MissionNote({ big = false }: { big?: boolean }) {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(localStorage.getItem("tars.mission") ?? "");
  }, []);
  useEffect(() => {
    if (editing) areaRef.current?.focus();
  }, [editing]);

  const save = (v: string) => {
    setText(v);
    localStorage.setItem("tars.mission", v);
  };

  const type = big ? "text-[14px] leading-[20px]" : "text-[10px] leading-[14px]";

  return (
    <div
      className={`relative -rotate-1 rounded-[2px] bg-[#d8cdb4] shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${
        big ? "px-3 pb-3 pt-2.5" : "px-2 pb-2 pt-1.5"
      }`}
    >
      <Pin />
      {editing ? (
        <textarea
          ref={areaRef}
          value={text}
          maxLength={90}
          rows={big ? 3 : 2}
          onChange={(e) => save(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
              e.preventDefault();
              setEditing(false);
            }
          }}
          aria-label="Your mission note"
          className={`w-full resize-none bg-transparent text-[#2e2a20] outline-none placeholder:text-[#8a7f68] ${type}`}
          placeholder="Your mission…"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={text ? `Mission note: ${text}. Tap to edit` : "Write your mission"}
          className={`w-full text-left text-[#2e2a20] ${type} ${
            big ? "min-h-[60px]" : "min-h-[30px]"
          }`}
        >
          {text || <span className="italic text-[#8a7f68]">Your mission…</span>}
        </button>
      )}
    </div>
  );
}

function Ticket({ big = false }: { big?: boolean }) {
  return (
    <div
      className={`font-mono-tars relative rotate-2 self-start rounded-[2px] bg-[#8a3c34] tracking-[0.14em] text-[#e8dcc3] shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${
        big ? "px-3 py-1.5 text-[9px]" : "px-2 py-1 text-[6.5px]"
      }`}
      style={{ clipPath: "polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%, 3% 50%)" }}
    >
      <Pin color="#c9a86a" />
      IMAX 70MM
    </div>
  );
}

function Credit({ big = false }: { big?: boolean }) {
  return (
    <div
      className={`font-mono-tars relative -rotate-1 rounded-[2px] bg-[#1c1a16] leading-relaxed tracking-[0.08em] text-[#a8a08e] shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${
        big ? "px-3 py-2 text-[9px]" : "px-2 py-1.5 text-[6.5px]"
      }`}
    >
      <Pin color="#3a5c4a" />
      INSPIRED BY THE FILMS OF CHRISTOPHER NOLAN.
    </div>
  );
}

/** The LED strip — fixed size; long messages scroll like a ticker. */
function LedStrip({
  notice,
  idleText,
  big = false,
}: {
  notice: string | null;
  idleText: string;
  big?: boolean;
}) {
  /* Latch the message until its scroll completes — the sender clears
     `notice` on a fixed timer shorter than a long ticker pass. */
  const [ledMsg, setLedMsg] = useState<string | null>(null);
  useEffect(() => {
    if (notice) setLedMsg(notice);
  }, [notice]);

  return (
    <div
      role="status"
      className={`font-mono-tars flex items-center overflow-hidden whitespace-nowrap rounded-[4px] border border-[#241811] bg-[#050703] tracking-[0.18em] shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_6px_14px_rgba(0,0,0,0.5)] ${
        big ? "h-[28px] text-[10px]" : "h-[22px] text-[7.5px]"
      }`}
    >
      {ledMsg ? (
        <span
          key={ledMsg}
          className="inline-block pl-[100%]"
          onAnimationEnd={() => setLedMsg(null)}
          style={{
            color: "#7fd8a0",
            textShadow: "0 0 6px rgba(127,216,160,0.6)",
            animation: `tars-ticker ${Math.max(6, ledMsg.length * 0.22)}s linear 1`,
          }}
        >
          {ledMsg.toUpperCase()}
        </span>
      ) : (
        <span
          key={idleText}
          className="block w-full text-center"
          style={{
            color: "#3a5c4a",
            textShadow: "0 0 4px rgba(58,92,74,0.4)",
            animation: "tars-fade-in 0.15s ease-out",
          }}
        >
          {idleText.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function PinBoard({
  notice,
  idleText,
}: {
  notice: string | null;
  idleText: string;
}) {
  const mobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  /* ---------------- mobile: chip + bottom sheet ---------------- */
  if (mobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Open mission board"
          className="tars-glass pointer-events-auto absolute right-3 top-[76px] z-30 flex h-11 w-11 items-center justify-center rounded-full text-[#c9bda4]"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 3h12v14H4z" />
            <path d="M7 7h6M7 10.5h6M7 14h3" />
          </svg>
        </button>

        {/* Portalled to <body>: this component renders inside Scene's room
            wrapper, which sets pointer-events:none (taps would fall through)
            and a CSS filter (which traps position:fixed and creates a
            stacking context that would bury the sheet under the player). */}
        {sheetOpen && mounted && createPortal(
          <>
            <div
              className="pointer-events-auto fixed inset-0 z-[70] bg-black/50 backdrop-blur-[3px]"
              onClick={() => setSheetOpen(false)}
              aria-hidden
              style={{ animation: "tars-fade-in 0.25s ease-out" }}
            />
            <div
              role="dialog"
              aria-label="Mission board"
              className="tars-glass pointer-events-auto fixed inset-x-0 bottom-0 z-[71] rounded-t-2xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
              style={{ animation: "tars-sheet-up 0.32s cubic-bezier(0.2,0.8,0.2,1)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono-tars text-[9px] tracking-[0.3em] text-[#8a8172]">
                  MISSION BOARD
                </span>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close mission board"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#8a8172]"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M3 3 L13 13 M13 3 L3 13" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-3.5 pb-1">
                <MissionNote big />
                <div className="flex items-center gap-3">
                  <Ticket big />
                  <Credit big />
                </div>
                <LedStrip notice={notice} idleText={idleText} big />
              </div>
            </div>
          </>,
          document.body
        )}
      </>
    );
  }

  /* ---------------- desktop: the hung board ---------------- */
  return (
    <div
      className="pointer-events-auto absolute right-[1%] top-[13%] z-10 w-[10.5%] min-w-[132px] rotate-[0.6deg]"
      aria-label="Pin board"
    >
      <div className="rounded-md border-[5px] border-[#241811] bg-[#4a3524] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.65)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              "radial-gradient(circle at 25% 30%, #3a2818 1px, transparent 1.5px), radial-gradient(circle at 70% 65%, #5c4430 1px, transparent 1.5px)",
            backgroundSize: "22px 22px, 28px 28px",
          }}
        />
        <div className="relative flex flex-col gap-2.5 py-1">
          <MissionNote />
          <Ticket />
          <Credit />
        </div>
      </div>
      <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[#241811]" aria-hidden />
      <div className="mt-2">
        <LedStrip notice={notice} idleText={idleText} />
      </div>
    </div>
  );
}
