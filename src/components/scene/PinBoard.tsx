"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small cork board hanging on the right bookshelf: the user's mission
 * note (persisted locally), a ticket stub, and the fan-project credit.
 * Small on purpose — it's one object in the room, not a panel.
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

function MissionNote() {
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

  return (
    <div className="relative -rotate-1 rounded-[2px] bg-[#d8cdb4] px-2 pb-2 pt-1.5 shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
      <Pin />
      {editing ? (
        <textarea
          ref={areaRef}
          value={text}
          maxLength={90}
          rows={2}
          onChange={(e) => save(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
              e.preventDefault();
              setEditing(false);
            }
          }}
          aria-label="Your mission note"
          className="w-full resize-none bg-transparent text-[10px] leading-[14px] text-[#2e2a20] outline-none placeholder:text-[#8a7f68]"
          placeholder="Your mission…"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={text ? `Mission note: ${text}. Click to edit` : "Write your mission"}
          className="min-h-[30px] w-full text-left text-[10px] leading-[14px] text-[#2e2a20]"
        >
          {text || <span className="italic text-[#8a7f68]">Your mission…</span>}
        </button>
      )}
    </div>
  );
}

export function PinBoard({
  notice,
  idleText,
}: {
  /** Message on the LED strip; null shows the idle text. */
  notice: string | null;
  idleText: string;
}) {
  /* Latch the message until its scroll completes — the sender clears
     `notice` on a fixed timer that is shorter than a long ticker pass,
     which would otherwise cut the text off mid-scroll. */
  const [ledMsg, setLedMsg] = useState<string | null>(null);
  useEffect(() => {
    if (notice) setLedMsg(notice);
  }, [notice]);

  return (
    <div
      className="pointer-events-auto absolute right-[1%] top-[13%] z-10 w-[10.5%] min-w-[132px] rotate-[0.6deg] max-lg:hidden"
      aria-label="Pin board"
    >
      {/* wooden frame + cork */}
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
          {/* ticket stub — IMAX, obviously */}
          <div
            className="font-mono-tars relative rotate-2 self-start rounded-[2px] bg-[#8a3c34] px-2 py-1 text-[6.5px] tracking-[0.14em] text-[#e8dcc3] shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%, 3% 50%)" }}
          >
            <Pin color="#c9a86a" />
            IMAX 70MM
          </div>
          {/* credit card */}
          <div className="font-mono-tars relative -rotate-1 rounded-[2px] bg-[#1c1a16] px-2 py-1.5 text-[6.5px] leading-relaxed tracking-[0.08em] text-[#a8a08e] shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
            <Pin color="#3a5c4a" />
            INSPIRED BY THE FILMS OF CHRISTOPHER NOLAN.
          </div>
        </div>
      </div>
      {/* hanging string */}
      <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[#241811]" aria-hidden />

      {/* LED message strip — fixed size; long messages scroll like a ticker */}
      <div
        role="status"
        className="font-mono-tars mt-2 flex h-[22px] items-center overflow-hidden whitespace-nowrap rounded-[4px] border border-[#241811] bg-[#050703] text-[7.5px] tracking-[0.18em] shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_6px_14px_rgba(0,0,0,0.5)]"
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
    </div>
  );
}
