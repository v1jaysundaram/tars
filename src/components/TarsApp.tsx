"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStation, type Station } from "@/data/stations";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { Scene } from "./scene/Scene";
import { Header } from "./Header";
import { PlayerPill } from "./PlayerPill";
import { StationSelector } from "./StationSelector";
import { MissionOverlay } from "./MissionOverlay";
import { SessionTimer } from "./SessionTimer";

const LS_STATION = "tars.station";

export function TarsApp() {
  const [station, setStation] = useState<Station>(() => getStation(null));
  const [started, setStarted] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* restore persisted choices (client-only, avoids hydration mismatch) */
  useEffect(() => {
    const s = localStorage.getItem(LS_STATION);
    if (s) setStation(getStation(s));
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3400);
  }, []);

  const ytEnabled = started;
  const {
    containerRef,
    state: yt,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  } = useYouTubePlayer({
    playlistId: station.youtubePlaylistId,
    enabled: ytEnabled,
    onNotice: showToast,
  });

  /* start playback once the player becomes ready after the user's click */
  const wantsPlayRef = useRef(false);
  useEffect(() => {
    if (yt.ready && wantsPlayRef.current) {
      wantsPlayRef.current = false;
      play();
    }
  }, [yt.ready, play]);

  /* session timer starts with first playback */
  useEffect(() => {
    if (yt.playing && !sessionStart) setSessionStart(Date.now());
  }, [yt.playing, sessionStart]);

  const chooseStation = useCallback(
    (s: Station, opts?: { silent?: boolean }) => {
      setStation(s);
      localStorage.setItem(LS_STATION, s.id);
      if (!opts?.silent) showToast("Course adjusted.");
    },
    [showToast]
  );

  const handleMissionChoice = useCallback(
    (s: Station) => {
      chooseStation(s, { silent: true });
      wantsPlayRef.current = true;
      setStarted(true);
    },
    [chooseStation]
  );

  const togglePlay = useCallback(() => {
    if (yt.playing) pause();
    else play();
  }, [yt.playing, play, pause]);

  /* spacebar toggles play/pause outside interactive elements */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const t = e.target as HTMLElement;
      if (
        t.closest("button, a, input, iframe, [role='dialog'], select, textarea")
      )
        return;
      e.preventDefault();
      if (ytEnabled && yt.ready) togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ytEnabled, yt.ready, togglePlay]);

  /* overflow:hidden still allows programmatic scroll (focus, find-in-page) —
     pin the scene so nothing can ever shove it off-frame */
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    };
    el.addEventListener("scroll", pin);
    return () => el.removeEventListener("scroll", pin);
  }, []);

  return (
    <main ref={mainRef} className="relative h-[100dvh] w-full overflow-hidden">
      <Scene
        station={station}
        playing={yt.playing}
        notice={toast}
        onRadioToggle={() => {
          if (ytEnabled && yt.ready) togglePlay();
        }}
        onWatchClick={() => showToast(station.clockRuleLine)}
        onTopEvent={() => {
          /* the top is a silent easter egg — no toast; those who know, know */
        }}
      />

      <Header station={station} />

      {started && (
        <>
          <PlayerPill
            station={station}
            yt={yt}
            ytContainerRef={containerRef}
            onPlayPause={togglePlay}
            onNext={next}
            onPrevious={previous}
            onSeek={seek}
            onPause={pause}
            onVolume={setVolume}
            onToggleMute={toggleMute}
            onOpenSelector={() => setSelectorOpen((v) => !v)}
          />
          {/* backdrop lives here, outside the selector's transformed wrapper —
              a transform ancestor would capture position:fixed and kill it.
              Stays mounted: the blur amount itself is transitioned, because
              opacity does not fade backdrop-filter. */}
          <div
            className="absolute inset-0 z-40"
            onClick={() => setSelectorOpen(false)}
            aria-hidden
            style={{
              backdropFilter: selectorOpen ? "blur(5px)" : "blur(0px)",
              WebkitBackdropFilter: selectorOpen ? "blur(5px)" : "blur(0px)",
              background: selectorOpen ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)",
              transition:
                "backdrop-filter 0.45s ease, -webkit-backdrop-filter 0.45s ease, background 0.45s ease",
              pointerEvents: selectorOpen ? "auto" : "none",
            }}
          />
          {/* selector renders after the pill so it always stacks above it */}
          {/* positioning is md-only: any transform here would capture the
              mobile sheet's position:fixed and drag it off-screen */}
          <div className="z-50 md:absolute md:bottom-[178px] md:left-1/2 md:w-[680px] md:max-w-[calc(100vw-1.5rem)] md:-translate-x-1/2">
            <StationSelector
              open={selectorOpen}
              activeId={station.id}
              onSelect={(s) => chooseStation(s)}
              onClose={() => setSelectorOpen(false)}
            />
          </div>
          <SessionTimer startedAt={sessionStart} />
        </>
      )}

      {/* toast */}
      {toast && (
        <div
          role="status"
          className="font-mono-tars absolute bottom-[172px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full lg:hidden border border-[#e8dcc3]/15 bg-black/70 px-4 py-1.5 text-[10px] tracking-[0.2em] text-[#cfc7b4] backdrop-blur"
          style={{ animation: "tars-toast 3.4s ease-in-out forwards" }}
        >
          {toast.toUpperCase()}
        </div>
      )}

      {/* credits */}
      <p className="font-mono-tars pointer-events-auto absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] right-4 z-30 text-right text-[8px] leading-relaxed tracking-[0.08em] text-[#4a453c] max-md:hidden">
        SOUND VIA YOUTUBE&trade; ·{" "}
        <a
          href="https://x.com/VijaySundaram_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6a6254] underline-offset-2 hover:text-[#c9a86a] hover:underline"
        >
          BUILT BY @VIJAYSUNDARAM_
        </a>
      </p>

      {!started && <MissionOverlay onChoose={handleMissionChoice} />}
    </main>
  );
}
