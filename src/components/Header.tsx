"use client";

import { useEffect, useState } from "react";
import type { Station } from "@/data/stations";

function useClock() {
  const [time, setTime] = useState<{ h: string; m: string } | null>(null);
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      setTime({
        h: String(d.getHours()).padStart(2, "0"),
        m: String(d.getMinutes()).padStart(2, "0"),
      });
    };
    fmt();
    const t = setInterval(fmt, 15_000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/* Module-scoped: survives StrictMode's double-mount in dev, resets on reload. */
let visitCounted = false;

/** Personal visit counter — honest without a backend: it's YOUR log. */
function useVisitLog() {
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => {
    /* one increment per page load; the module flag absorbs StrictMode's
       double-effect without also swallowing genuine refreshes */
    let n = parseInt(localStorage.getItem("tars.visits") ?? "0", 10) || 0;
    if (!visitCounted) {
      visitCounted = true;
      n += 1;
      localStorage.setItem("tars.visits", String(n));
    }
    setVisits(n);
  }, []);
  return visits;
}

export function Header({ station }: { station: Station }) {
  const time = useClock();
  const visits = useVisitLog();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-5 max-md:p-3.5">
      {/* mission clock */}
      <div className="font-mono-tars pointer-events-auto select-none">
        <div
          className="text-xl leading-none tracking-[0.18em] text-[#e8dcc3] [text-shadow:0_0_14px_rgba(240,180,106,0.3)] max-md:text-base"
          suppressHydrationWarning
        >
          {time ? (
            <>
              {time.h}
              <span style={{ animation: "tars-colon 1s steps(1) infinite" }}>:</span>
              {time.m}
            </>
          ) : (
            "--:--"
          )}
        </div>
        <div className="mt-1 text-[9px] tracking-[0.32em] text-[#8a8172]">
          EARTH TIME
        </div>
        {/* not the user's location — a per-station coordinate, part of the bit */}
        <div
          key={station.id}
          className="mt-1.5 text-[9px] tracking-[0.18em] text-[#5c564a]"
          style={{ animation: "tars-fade-in 1.8s ease-out" }}
        >
          {station.location}
        </div>
      </div>

      {/* live dot + your mission log count */}
      <div className="pointer-events-auto flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-green-400"
            style={{ animation: "tars-pulse 2.6s ease-out infinite" }}
            aria-hidden
          />
          <span className="font-mono-tars text-[10px] tracking-[0.3em] text-[#a8a08e]">
            LIVE
          </span>
        </div>
        {visits !== null && (
          <span
            className="font-mono-tars text-[9px] tracking-[0.22em] text-[#5c564a]"
            title="Your visits from this browser"
          >
            LOG {String(visits).padStart(4, "0")}
          </span>
        )}
      </div>
    </header>
  );
}
