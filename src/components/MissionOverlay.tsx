"use client";

import { useEffect, useState } from "react";
import { STATIONS, type Station } from "@/data/stations";
import { StationCard } from "./StationSelector";

/**
 * First-entry overlay. Browsers block autoplay, so playback must start
 * from a user click — this turns that constraint into the opening beat.
 */
export function MissionOverlay({
  onChoose,
}: {
  onChoose: (station: Station) => void;
}) {
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute inset-0 z-[60] grid place-items-center bg-black/62 p-4 backdrop-blur-[6px]"
      style={{ animation: "tars-fade-in 0.6s ease-out" }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose your mission"
    >
      <div className="tars-glass w-full max-w-[460px] rounded-2xl p-6 max-md:max-h-[86dvh] max-md:overflow-y-auto max-md:p-4">
        <p className="font-mono-tars text-[10px] tracking-[0.3em] text-[#8a8172]">
          {booted ? "SYSTEMS NOMINAL" : "BOOTING."}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[0.06em] text-[#e8e2d4]">
          Choose your mission.
        </h2>
        <p className="mt-1 text-[12px] text-[#a8a08e]">
          Six scores. One desk. Playback starts on your mark.
        </p>
        <div className="mt-5 flex flex-col gap-1.5">
          {STATIONS.map((s, i) => (
            <StationCard
              key={s.id}
              station={s}
              active={false}
              autoFocus={i === 0}
              onSelect={() => onChoose(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
