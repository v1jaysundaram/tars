"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Station } from "@/data/stations";
import type { YtState } from "@/hooks/useYouTubePlayer";

function fmtTime(s: number) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const SLEEP_OPTIONS = [5, 15, 30, 45, 60] as const;

function SleepTimer({ onExpire }: { onExpire: () => void }) {
  const [open, setOpen] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const rem = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        setEndsAt(null);
        expireRef.current();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (endsAt ? setEndsAt(null) : setOpen((v) => !v))}
        aria-label={
          endsAt
            ? `Sleep timer running, ${fmtTime(left)} left — click to cancel`
            : "Set sleep timer"
        }
        className={`font-mono-tars rounded-full border px-3 py-1.5 text-[10px] tracking-[0.18em] transition-colors ${
          endsAt
            ? "border-[#e8dcc3]/45 bg-[#e8dcc3]/12 text-[#e8dcc3]"
            : "border-[#e8dcc3]/20 text-[#a8a08e] hover:border-[#e8dcc3]/40 hover:text-[#e8e2d4]"
        }`}
      >
        {endsAt ? `SLEEP ${fmtTime(left)}` : "SLEEP"}
      </button>
      {open && !endsAt && (
        <div
          className="tars-glass absolute bottom-[calc(100%+8px)] right-0 z-50 flex flex-col rounded-xl p-1"
          role="menu"
          aria-label="Sleep timer duration"
        >
          {SLEEP_OPTIONS.map((min) => (
            <button
              key={min}
              type="button"
              role="menuitem"
              onClick={() => {
                setEndsAt(Date.now() + min * 60_000);
                setOpen(false);
              }}
              className="font-mono-tars whitespace-nowrap rounded-lg px-4 py-1.5 text-left text-[10px] tracking-[0.14em] text-[#a8a08e] hover:bg-[#e8dcc3]/8 hover:text-[#e8e2d4]"
            >
              {min < 60 ? `${min} MIN` : "1 HOUR"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const btn =
  "grid place-items-center rounded-full text-[#e8e2d4] transition-colors hover:bg-[#e8dcc3]/10 disabled:opacity-30 disabled:hover:bg-transparent";

export function PlayerPill({
  station,
  yt,
  ytContainerRef,
  onPlayPause,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolume,
  onToggleMute,
  onOpenSelector,
}: {
  station: Station;
  yt: YtState;
  ytContainerRef: RefObject<HTMLDivElement | null>;
  onPlayPause: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolume: (v: number) => void;
  onToggleMute: () => void;
  onOpenSelector: () => void;
}) {
  const configured = Boolean(station.youtubePlaylistId);
  /* local scrub value while dragging — committing on release keeps the
     thumb from fighting the 0.5s progress poll mid-drag */
  const [scrub, setScrub] = useState<number | null>(null);
  const commitScrub = () => {
    if (scrub !== null) {
      onSeek(scrub);
      setScrub(null);
    }
  };

  return (
    <div
      className="absolute bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[600px] max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
      style={{ animation: "tars-rise 0.7s cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      {/* change-station button, perched on the pill */}
      <div className="mb-1.5 flex justify-center">
        <button
          type="button"
          onClick={onOpenSelector}
          className="tars-glass flex min-h-[32px] items-center gap-2 rounded-full px-3.5 py-1 text-[9px] font-medium tracking-[0.22em] text-[#a8a08e] transition-colors hover:text-[#e8e2d4]"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: station.accentColor,
              boxShadow: `0 0 6px ${station.accentColor}`,
            }}
            aria-hidden
          />
          CHANGE STATION
        </button>
      </div>

      <div className="tars-glass rounded-[24px] px-4 py-3 max-md:px-3">
        <div className="flex items-center gap-4 max-md:gap-2.5">
          {/* left: artwork + track identity */}
          <div
            ref={ytContainerRef}
            className={`relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-xl bg-black/60 [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-1/2 [&_iframe]:h-full [&_iframe]:w-[176%] [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2 ${
              configured ? "" : "hidden"
            }`}
            aria-label="YouTube player"
          />
          <div className="w-[168px] min-w-0 shrink-0 max-md:w-auto max-md:flex-1">
            {configured ? (
              <>
                <div className="truncate text-[14px] font-semibold leading-snug text-[#f0ece0]">
                  {yt.track?.title ?? (
                    <span className="inline-block h-3.5 w-32 animate-pulse rounded bg-[#e8dcc3]/12 align-middle" />
                  )}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[#a8a08e]">
                  {yt.track?.author}
                </div>
                <div className="font-mono-tars mt-0.5 truncate text-[9px] tracking-[0.16em] text-[#6a6254]">
                  {station.film.toUpperCase()}
                </div>
              </>
            ) : (
              <div className="text-[12px] leading-snug text-[#a8a08e]">
                <span className="text-[#e8e2d4]">{station.film}</span> isn&apos;t
                tuned yet.
              </div>
            )}
          </div>

          {/* center: transport over a compact progress bar */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 max-md:hidden">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onPrevious} disabled={!yt.ready || !configured}
                aria-label="Previous track" className={`${btn} h-9 w-9`}>
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M4 3 h2 v14 H4 Z M17 3 v14 L7 10 Z" />
                </svg>
              </button>
              <button type="button" onClick={onPlayPause} disabled={!yt.ready || !configured}
                aria-label={yt.playing ? "Pause" : "Play"}
                className={`${btn} h-11 w-11 border border-[#e8dcc3]/25 bg-[#e8dcc3]/10`}>
                {yt.playing ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M5 3 h3.5 v14 H5 Z M11.5 3 H15 v14 h-3.5 Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M5 3 L17 10 L5 17 Z" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={onNext} disabled={!yt.ready || !configured}
                aria-label="Next track" className={`${btn} h-9 w-9`}>
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M14 3 h2 v14 h-2 Z M3 3 v14 l10 -7 Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* mobile transport (no progress/volume) */}
          <div className="hidden shrink-0 items-center gap-1 max-md:flex">
            <button type="button" onClick={onPlayPause} disabled={!yt.ready || !configured}
              aria-label={yt.playing ? "Pause" : "Play"}
              className={`${btn} h-11 w-11 border border-[#e8dcc3]/25 bg-[#e8dcc3]/10`}>
              {yt.playing ? (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M5 3 h3.5 v14 H5 Z M11.5 3 H15 v14 h-3.5 Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M5 3 L17 10 L5 17 Z" />
                </svg>
              )}
            </button>
            <button type="button" onClick={onNext} disabled={!yt.ready || !configured}
              aria-label="Next track" className={`${btn} h-10 w-10`}>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path d="M14 3 h2 v14 h-2 Z M3 3 v14 l10 -7 Z" />
              </svg>
            </button>
          </div>

          {/* right: fixed-width column — volume expands inside it, sleep below */}
          {configured && (
            <div className="flex w-[104px] shrink-0 flex-col items-end gap-1.5 max-md:hidden">
              <div className="group flex h-6 items-center justify-end">
                <button
                  type="button"
                  onClick={onToggleMute}
                  aria-label={yt.muted ? "Unmute" : "Mute"}
                  className="grid h-6 w-6 place-items-center text-[#8a8172] hover:text-[#e8e2d4]"
                >
                  {yt.muted || yt.volume === 0 ? (
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                      <path d="M3 7v6h4l5 4V3L7 7H3Zm12.7 3 2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4L12.9 10l-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4L15.7 10Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                      <path d="M3 7v6h4l5 4V3L7 7H3Zm11.5 3a3.5 3.5 0 0 0-2-3.2v6.4a3.5 3.5 0 0 0 2-3.2Zm-2-7v2.1a5 5 0 0 1 0 9.8V17a7 7 0 0 0 0-14Z" />
                    </svg>
                  )}
                </button>
                <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 group-focus-within:w-[64px] group-focus-within:opacity-100 group-hover:w-[64px] group-hover:opacity-100">
                  <input
                    type="range"
                    className="tars-range w-[60px]"
                    min={0}
                    max={100}
                    value={yt.muted ? 0 : yt.volume}
                    onChange={(e) => onVolume(Number(e.target.value))}
                    aria-label="Volume"
                    disabled={!yt.ready}
                  />
                </div>
              </div>
              <SleepTimer onExpire={onPause} />
            </div>
          )}
        </div>

        {/* seek — its own strip, clear of the transport, taller hit area */}
        {configured && (
          <div className="mx-auto mt-2 flex w-full max-w-[440px] items-center gap-2.5 max-md:hidden">
            <span className="font-mono-tars w-8 shrink-0 text-right text-[9px] text-[#8a8172]">
              {fmtTime(scrub ?? yt.currentTime)}
            </span>
            <input
              type="range"
              className="tars-range h-4 flex-1"
              min={0}
              max={Math.max(yt.duration, 1)}
              step={1}
              value={Math.min(scrub ?? yt.currentTime, yt.duration || 0)}
              onChange={(e) => setScrub(Number(e.target.value))}
              onPointerUp={commitScrub}
              onKeyUp={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") commitScrub();
              }}
              aria-label="Seek"
              disabled={!yt.ready || !yt.duration}
            />
            <span className="font-mono-tars w-8 shrink-0 text-[9px] text-[#8a8172]">
              {fmtTime(yt.duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
