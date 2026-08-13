"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around the official YouTube IFrame Player API.
 * Owns nothing about stations or the scene — it is handed a playlist ID
 * and a container, and reports back track metadata, progress and errors.
 *
 * Embed rules honoured here:
 *  - official API only, playsinline, no autoplay before user gesture
 *  - unavailable / embed-disabled videos: skip to next + quiet notice
 */

type YTPlayer = {
  loadPlaylist: (opts: { listType: string; list: string }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  stopVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoData: () => { title?: string; author?: string; video_id?: string };
  getPlaylistId?: () => string | null;
  setVolume: (v: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setLoop: (loop: boolean) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: unknown) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YtTrack {
  title: string;
  author: string;
  videoId: string;
}

export interface YtState {
  ready: boolean;
  playing: boolean;
  track: YtTrack | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

let apiPromise: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise<void>((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}

export function useYouTubePlayer({
  playlistId,
  enabled,
  onNotice,
}: {
  playlistId: string;
  enabled: boolean;
  onNotice: (msg: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [state, setState] = useState<YtState>({
    ready: false,
    playing: false,
    track: null,
    currentTime: 0,
    duration: 0,
    volume: 100,
    muted: false,
  });
  const noticeRef = useRef(onNotice);
  noticeRef.current = onNotice;
  const errorCountRef = useRef(0);
  /* The playlist the player has actually been told to load. */
  const loadedListRef = useRef<string | null>(null);
  const playlistIdRef = useRef(playlistId);
  playlistIdRef.current = playlistId;

  /** Idempotent: (re)load whatever station is current. Safe to call often. */
  const syncPlaylist = useCallback(() => {
    const p = playerRef.current;
    const wanted = playlistIdRef.current;
    if (!p || !wanted || loadedListRef.current === wanted) return;
    loadedListRef.current = wanted;
    errorCountRef.current = 0;
    setState((s) => ({ ...s, track: null, currentTime: 0, duration: 0 }));
    /* loadPlaylist while a video is actively playing gets applied one
       request late (observed 2026-08-11) — stop first, then load. */
    try {
      p.stopVideo();
    } catch {
      /* not started yet */
    }
    p.loadPlaylist({ listType: "playlist", list: wanted });
    p.setLoop(true);
  }, []);

  /* Create the player once (per enable). The playlist is NOT baked into
     playerVars — onReady always syncs to the *current* station, and every
     later station change goes through the same syncPlaylist path. */
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let created: YTPlayer | null = null;

    loadApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      const host = document.createElement("div");
      containerRef.current.appendChild(host);
      created = new window.YT.Player(host, {
        width: "100%",
        height: "100%",
        playerVars: {
          playsinline: 1,
          rel: 0,
          controls: 1,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            playerRef.current = created;
            setState((s) => ({
              ...s,
              ready: true,
              volume: created?.getVolume() ?? 100,
              muted: created?.isMuted() ?? false,
            }));
          },
          onStateChange: (e: { data: number }) => {
            if (cancelled || !window.YT) return;
            const playing = e.data === window.YT.PlayerState.PLAYING;
            if (playing) errorCountRef.current = 0;
            const data = created?.getVideoData();
            setState((s) => ({
              ...s,
              playing,
              track: data?.video_id
                ? {
                    title: data.title ?? "",
                    author: (data.author ?? "").replace(/ - Topic$/, ""),
                    videoId: data.video_id,
                  }
                : s.track,
              duration: created?.getDuration() ?? s.duration,
            }));
          },
          onError: () => {
            if (cancelled || !loadedListRef.current) return;
            errorCountRef.current += 1;
            if (errorCountRef.current <= 8) {
              noticeRef.current(
                "That one refused to play. Skipping."
              );
              created?.nextVideo();
            } else {
              noticeRef.current(
                "This playlist won't embed. Use Open in YouTube below."
              );
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      loadedListRef.current = null;
      try {
        created?.destroy();
      } catch {
        /* iframe already gone */
      }
      setState((s) => ({
        ...s,
        ready: false,
        playing: false,
        track: null,
        currentTime: 0,
        duration: 0,
      }));
    };
  }, [enabled]);

  /* One sync path for both "player just became ready" and "station changed". */
  useEffect(() => {
    if (!state.ready) return;
    syncPlaylist();
  }, [state.ready, playlistId, syncPlaylist]);

  /* Progress + metadata polling while playing. */
  useEffect(() => {
    if (!state.playing) return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const data = p.getVideoData();
      setState((s) => ({
        ...s,
        currentTime: p.getCurrentTime() ?? 0,
        duration: p.getDuration() ?? 0,
        track: data?.video_id
          ? {
              title: data.title ?? "",
              author: (data.author ?? "").replace(/ - Topic$/, ""),
              videoId: data.video_id,
            }
          : s.track,
      }));
    }, 500);
    return () => clearInterval(t);
  }, [state.playing]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const next = useCallback(() => playerRef.current?.nextVideo(), []);
  const previous = useCallback(() => playerRef.current?.previousVideo(), []);
  const seek = useCallback(
    (s: number) => playerRef.current?.seekTo(s, true),
    []
  );
  const setVolume = useCallback((v: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    if (v > 0 && p.isMuted()) p.unMute();
    setState((s) => ({ ...s, volume: v, muted: v === 0 ? s.muted : false }));
  }, []);
  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setState((s) => ({ ...s, muted: false }));
    } else {
      p.mute();
      setState((s) => ({ ...s, muted: true }));
    }
  }, []);

  return {
    containerRef,
    state,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  };
}
