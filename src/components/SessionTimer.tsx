"use client";

import { useEffect, useState } from "react";

const MILLER_THRESHOLD = 23 * 60; // seconds — one small easter egg, whisper-quiet

function fmt(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function SessionTimer({ startedAt }: { startedAt: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  if (!startedAt) return null;

  // 1 hour on Miller's planet ≈ 7 years. Scale from elapsed focus time.
  const millerYears = ((elapsed / 3600) * 7).toFixed(0);

  return (
    <div className="font-mono-tars pointer-events-none absolute bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-5 z-30 select-none max-md:hidden">
      <div className="text-[11px] tracking-[0.22em] text-[#a8a08e]">
        SESSION {fmt(elapsed)}
      </div>
      {elapsed >= MILLER_THRESHOLD && (
        <div
          className="mt-0.5 text-[9px] tracking-[0.14em] text-[#5c564a]"
          style={{ animation: "tars-fade-in 3s ease-out" }}
        >
          ≈ {millerYears} {millerYears === "1" ? "year" : "years"} on Miller&apos;s planet
        </div>
      )}
    </div>
  );
}
