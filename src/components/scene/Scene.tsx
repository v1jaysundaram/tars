"use client";

import { useEffect, useRef, useState } from "react";
import type { Station } from "@/data/stations";
import { STATIONS } from "@/data/stations";
import { WindowView } from "./WindowView";
import { PinBoard } from "./PinBoard";

/**
 * The illustrated room: observation window (station views), bookshelf
 * silhouettes, desk foreground, lamp light, dust motes, grain.
 * Knows the active station and whether music is playing — nothing about
 * providers. Interactions (radio, watch, top) bubble up via callbacks.
 */

/**
 * Viewport check for layouts CSS alone can't express (SVG viewBox, hit-target
 * sizing). Starts false so SSR and first client render agree, then corrects.
 */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

function DustMotes({ slow }: { slow: boolean }) {
  const motes = Array.from({ length: 14 }, (_, i) => ({
    left: 8 + ((i * 37) % 60),
    bottom: 4 + ((i * 23) % 30),
    size: 1 + (i % 3),
    dur: (9 + (i % 7) * 2) * (slow ? 2.2 : 1),
    delay: (i * 1.7) % 12,
    dx: ((i % 5) - 2) * 14,
    dy: -30 - (i % 4) * 16,
    max: 0.25 + (i % 4) * 0.1,
  }));
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={`${i}-${slow}`}
          className="absolute rounded-full bg-[#f0d9a8]"
          style={{
            left: `${m.left}%`,
            bottom: `${m.bottom}%`,
            width: m.size,
            height: m.size,
            opacity: 0,
            ["--mote-dx" as string]: `${m.dx}px`,
            ["--mote-dy" as string]: `${m.dy}px`,
            ["--mote-max" as string]: m.max,
            animation: `tars-mote ${m.dur}s linear infinite`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- wristwatch with per-station time rules ---------------- */

function useWatchAngles(rule: Station["clockRule"]) {
  const [angles, setAngles] = useState({ h: 0, m: 0, s: 0, shadow: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const rs = now.getSeconds() + now.getMilliseconds() / 1000;
      const rm = now.getMinutes() + rs / 60;
      const rh = (now.getHours() % 12) + rm / 60;
      let h = rh * 30;
      let m = rm * 6;
      let s = rs * 6;
      let shadow = 0;
      switch (rule) {
        case "backward": {
          h = -h;
          m = -m;
          s = -s;
          break;
        }
        case "slow": {
          // second hand crawls — one revolution every 7 minutes
          s = ((now.getTime() / 1000) % 420) * (360 / 420);
          break;
        }
        case "frozen": {
          // 05:29:45 — the Trinity test, held forever
          h = (5 + 29.75 / 60) * 30;
          m = 29.75 * 6;
          s = 45 * 6;
          break;
        }
        case "dream": {
          // the world above; the shadow hand lives twelve times faster
          shadow = ((now.getTime() / 1000) * 12 * 6) % 360;
          break;
        }
      }
      setAngles({ h, m, s, shadow });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [rule]);
  return angles;
}

function Wristwatch({
  station,
  mobile,
  onClick,
}: {
  station: Station;
  /** Touch needs a far bigger target than the drawn watch face. */
  mobile?: boolean;
  onClick: () => void;
}) {
  const { h, m, s, shadow } = useWatchAngles(station.clockRule);
  const smooth = { transition: "transform 0.9s cubic-bezier(0.3,0,0.2,1)" };
  return (
    <g
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Wristwatch — ${station.clockRuleLine}`}
      onMouseDown={(e) => e.preventDefault()}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    >
      {mobile && <circle cx="960" cy="162" r="52" fill="transparent" />}
      <ellipse cx="960" cy="170" rx="24" ry="6" fill="#0a0603" opacity="0.55" />
      <path
        d="M938 168 C934 158 942 150 950 152 M982 168 C986 158 978 150 970 152"
        stroke="#54432c"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="960" cy="162" r="15" fill="#12100c" stroke="#c9a86a" strokeWidth="1.6" />
      {/* hour markers */}
      {Array.from({ length: 4 }, (_, i) => {
        const a = (i * Math.PI) / 2;
        return (
          <circle
            key={i}
            cx={960 + 11.5 * Math.sin(a)}
            cy={162 - 11.5 * Math.cos(a)}
            r="0.7"
            fill="#c9a86a"
            opacity="0.7"
          />
        );
      })}
      {/* dream shadow hand — beneath the real hands */}
      {station.clockRule === "dream" && (
        <line
          x1="960" y1="162" x2="960" y2="150.5"
          stroke="#d99a4e" strokeWidth="0.8" opacity="0.35"
          style={{ transformOrigin: "960px 162px", transform: `rotate(${shadow}deg)`, ...smooth }}
        />
      )}
      <line
        x1="960" y1="162" x2="960" y2="154"
        stroke="#e8dcc3" strokeWidth="1.4" strokeLinecap="round"
        style={{ transformOrigin: "960px 162px", transform: `rotate(${h}deg)`, ...smooth }}
      />
      <line
        x1="960" y1="162" x2="960" y2="151.5"
        stroke="#e8dcc3" strokeWidth="1.1" strokeLinecap="round"
        style={{ transformOrigin: "960px 162px", transform: `rotate(${m}deg)`, ...smooth }}
      />
      <line
        x1="960" y1="163.5" x2="960" y2="150"
        stroke="#d94f3c" strokeWidth="0.7"
        style={{ transformOrigin: "960px 162px", transform: `rotate(${s}deg)`, ...smooth }}
      />
      <circle cx="960" cy="162" r="1" fill="#e8dcc3" />
    </g>
  );
}

/* ---------------- the totem ---------------- */

type TopPhase = "idle" | "spinning" | "fallen";

function SpinningTop({
  eternal,
  mobile,
  onSpin,
}: {
  /** LIMBO: the top never falls. */
  eternal: boolean;
  mobile?: boolean;
  onSpin: (phase: TopPhase) => void;
}) {
  const [phase, setPhase] = useState<TopPhase>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* the top remembers — its state survives a reload */
  useEffect(() => {
    const stored = localStorage.getItem("tars.top") as TopPhase | null;
    if (stored === "spinning" && eternal) setPhase("spinning");
    else if (stored === "fallen" && !eternal) setPhase("fallen");
    else setPhase("idle");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [eternal]);

  const persist = (p: TopPhase) => localStorage.setItem("tars.top", p);

  const spin = () => {
    if (timer.current) clearTimeout(timer.current);
    setPhase("spinning");
    persist("spinning");
    onSpin("spinning");
    if (!eternal) {
      timer.current = setTimeout(() => {
        setPhase("fallen");
        persist("fallen");
        onSpin("fallen");
      }, 7000);
    }
  };

  return (
    <g
      onClick={spin}
      onKeyDown={(e) => e.key === "Enter" && spin()}
      role="button"
      tabIndex={0}
      aria-label={
        phase === "spinning"
          ? "Spinning top — still going"
          : "Spinning top — click to spin"
      }
      onMouseDown={(e) => e.preventDefault()}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    >
      {/* touch target; drawn before the radio so the radio wins any overlap */}
      {mobile && <circle cx="608" cy="166" r="44" fill="transparent" />}
      <ellipse cx="612" cy="176" rx="13" ry="3.5" fill="#0a0603" opacity="0.5" />
      <g
        style={{
          transformOrigin: "612px 173px",
          transition: "transform 1.4s cubic-bezier(0.6,0,0.8,1)",
          transform: phase === "fallen" ? "rotate(84deg) translate(2px,-2px)" : "none",
        }}
      >
        <g
          style={
            phase === "spinning"
              ? { transformOrigin: "612px 165px", animation: "tars-rotate 0.35s linear infinite" }
              : undefined
          }
        >
          {/* body — brass top */}
          <path d="M612 174 L604 162 C604 156 620 156 620 162 Z" fill="#a8845c" />
          <path d="M612 174 L604 162 C604 156 620 156 620 162 Z" fill="#e0b070" opacity="0.35" />
          <rect x="610.8" y="151" width="2.4" height="6" rx="1" fill="#8a6a48" />
          <circle cx="612" cy="158" r="3.6" fill="#a8845c" />
          <ellipse cx="610.5" cy="157" rx="1.1" ry="1.6" fill="#e8dcc3" opacity="0.4" />
        </g>
      </g>
      {phase === "spinning" && (
        <ellipse
          cx="612" cy="175" rx="11" ry="2.5"
          fill="none" stroke="#e0b070" strokeWidth="0.5" opacity="0.4"
          style={{ animation: "tars-twinkle 0.7s ease-in-out infinite" }}
        />
      )}
    </g>
  );
}

/* ---------------- per-station desk props (crossfaded) ---------------- */

function StationProps({ activeId }: { activeId: string }) {
  const groups: Record<string, React.ReactElement> = {
    /* Interstellar — a small ring-station model on a stand */
    "no-time-for-caution": (
      <g>
        <ellipse cx="1235" cy="150" rx="30" ry="5" fill="#0a0603" opacity="0.5" />
        <rect x="1232" y="128" width="5" height="20" rx="2" fill="#141210" />
        <g style={{ transformOrigin: "1234px 112px", animation: "tars-rotate 40s linear infinite" }}>
          <circle cx="1234" cy="112" r="16" fill="none" stroke="#cfd6e4" strokeWidth="2.4" opacity="0.85" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <line
                key={i}
                x1={1234 + 4 * Math.cos(a)} y1={112 + 4 * Math.sin(a)}
                x2={1234 + 14 * Math.cos(a)} y2={112 + 14 * Math.sin(a)}
                stroke="#cfd6e4" strokeWidth="0.8" opacity="0.6"
              />
            );
          })}
          <circle cx="1234" cy="112" r="3.2" fill="none" stroke="#cfd6e4" strokeWidth="1.4" opacity="0.9" />
        </g>
      </g>
    ),
    /* Dunkirk — channel chart + a fuel gauge draining toward E */
    "the-mole": (
      <g>
        <g>
          <circle cx="1165" cy="98" r="11" fill="#1c1814" stroke="#54432c" strokeWidth="1.6" />
          <path d="M1157 92 A11 11 0 0 1 1173 92" fill="none" stroke="#8ba3b5" strokeWidth="1" opacity="0.5" />
          <text x="1157.5" y="106" fontSize="4.5" fill="#8a8172" style={{ fontFamily: "var(--font-mono), monospace" }}>E</text>
          <text x="1169.5" y="106" fontSize="4.5" fill="#8a8172" style={{ fontFamily: "var(--font-mono), monospace" }}>F</text>
          <line
            x1="1165" y1="98" x2="1165" y2="90"
            stroke="#d94f3c" strokeWidth="1"
            style={{
              transformOrigin: "1165px 98px",
              animation: "tars-gauge 3600s linear forwards",
            }}
          />
          <circle cx="1165" cy="98" r="1.2" fill="#54432c" />
          <rect x="1162" y="108" width="6" height="4" fill="#141210" />
        </g>
        <path d="M1190 132 L1288 138 L1282 168 L1184 161 Z" fill="#c2bda8" />
        <path d="M1190 132 L1288 138 L1287 143 L1189 137 Z" fill="#a8a390" />
        <path d="M1200 156 C1216 148 1238 158 1254 147 C1262 143 1270 146 1276 143"
          fill="none" stroke="#5c6b6a" strokeWidth="1.1" strokeDasharray="3 2" />
        <circle cx="1200" cy="156" r="1.6" fill="#8a4a3c" />
        <circle cx="1276" cy="143" r="1.6" fill="#3a4a5c" />
        <path d="M1206 140 L1212 152 M1226 142 L1224 154 M1246 144 L1250 152"
          stroke="#8a8572" strokeWidth="0.6" opacity="0.7" fill="none" />
      </g>
    ),
    /* Oppenheimer — a small chalk slate leaning on the books */
    trinity: (
      <g>
        <path d="M1188 96 L1258 96 L1262 150 L1184 150 Z" fill="#1c2420" />
        <path d="M1188 96 L1258 96 L1262 150 L1184 150 Z" fill="none" stroke="#54432c" strokeWidth="2.5" />
        <g stroke="#d8cfc0" strokeWidth="0.8" opacity="0.75" fill="none">
          <path d="M1194 108 q4 -4 8 0 t8 0" />
          <path d="M1214 104 l6 8 m0 -8 l-6 8" />
          <path d="M1226 110 h12 m-6 -5 v10" />
          <path d="M1194 122 h20 m4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
          <path d="M1232 124 l8 -6 m-8 0 l8 6" />
          <path d="M1194 138 q8 6 16 0 q8 -6 16 0" />
        </g>
      </g>
    ),
    /* Tenet — an hourglass whose sand falls upward */
    "the-algorithm": (
      <g>
        <ellipse cx="1225" cy="151" rx="16" ry="3.5" fill="#0a0603" opacity="0.5" />
        <rect x="1211" y="100" width="28" height="4" rx="1.5" fill="#54432c" />
        <rect x="1211" y="146" width="28" height="4" rx="1.5" fill="#54432c" />
        <path d="M1214 104 L1236 104 L1226.5 124 L1236 146 L1214 146 L1223.5 124 Z"
          fill="#7fc4bc" opacity="0.14" stroke="#5fb3ad" strokeWidth="0.9" />
        {/* sand collected in the TOP bulb; grains rise */}
        <path d="M1216 104 L1234 104 L1229 114 L1221 114 Z" fill="#c9b490" opacity="0.85" />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={1224 + i * 1.6}
            cy={140 - i * 3}
            r="0.7"
            fill="#c9b490"
            style={{
              animation: `tars-mote ${3 + i}s linear infinite reverse`,
              ["--mote-dy" as string]: "26px",
              ["--mote-dx" as string]: "0px",
              ["--mote-max" as string]: 0.9,
            }}
          />
        ))}
      </g>
    ),
    /* Inception — a loaded die beside the top (Arthur's totem) */
    limbo: (
      <g>
        <ellipse cx="1232" cy="152" rx="10" ry="2.5" fill="#0a0603" opacity="0.5" />
        <rect x="1224" y="136" width="15" height="15" rx="2.5" fill="#8a3c34" transform="rotate(-8 1224 136)" />
        <rect x="1224" y="136" width="15" height="15" rx="2.5" fill="#e0b070" opacity="0.12" transform="rotate(-8 1224 136)" />
        <g fill="#e8dcc3" transform="rotate(-8 1224 136)">
          <circle cx="1228.5" cy="140.5" r="1.1" />
          <circle cx="1235.5" cy="140.5" r="1.1" />
          <circle cx="1232" cy="143.5" r="1.1" />
          <circle cx="1228.5" cy="146.5" r="1.1" />
          <circle cx="1235.5" cy="146.5" r="1.1" />
        </g>
      </g>
    ),
    /* Odyssey — rope coil and a bronze compass */
    "wine-dark-sea": (
      <g>
        <ellipse cx="1206" cy="150" rx="22" ry="5" fill="#0a0603" opacity="0.5" />
        <g fill="none" stroke="#a8845c" strokeWidth="3.4" opacity="0.9">
          <ellipse cx="1206" cy="146" rx="18" ry="6" />
          <ellipse cx="1206" cy="142" rx="15" ry="5" />
          <ellipse cx="1206" cy="138.5" rx="11" ry="4" />
        </g>
        <circle cx="1252" cy="148" r="9" fill="#54432c" stroke="#c9a86a" strokeWidth="1.4" />
        <circle cx="1252" cy="148" r="6.5" fill="#12100c" />
        <path d="M1252 143.5 L1254 148 L1252 152.5 L1250 148 Z" fill="#d94f3c" />
        <path d="M1252 143.5 L1254 148 L1252 148 Z" fill="#e8dcc3" />
      </g>
    ),
  };

  return (
    <>
      {Object.entries(groups).map(([id, el]) => (
        <g
          key={id}
          style={{
            opacity: id === activeId ? 1 : 0,
            transition: "opacity 1.8s ease-in-out",
            pointerEvents: "none",
          }}
          aria-hidden={id !== activeId}
        >
          {el}
        </g>
      ))}
    </>
  );
}

/* Trinity: a chalk countdown that never reaches zero. */
function NeverZero() {
  const [n, setN] = useState(10);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v <= 1 ? 10 : v - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <text
      x="1224"
      y="146"
      textAnchor="middle"
      fontSize="6.5"
      fill="#d8cfc0"
      opacity="0.8"
      style={{ fontFamily: "var(--font-mono), monospace" }}
    >
      T−{String(n).padStart(2, "0")}
    </text>
  );
}

/* ---------------- the desk ---------------- */

function Desk({
  station,
  playing,
  lampOn,
  mobile,
  shockKey,
  onLampToggle,
  onRadioToggle,
  onWatchClick,
  onTopEvent,
}: {
  station: Station;
  playing: boolean;
  lampOn: boolean;
  mobile: boolean;
  /** Trinity: increments ~40s after the flash — the shockwave arrives. */
  shockKey: number;
  onLampToggle: () => void;
  onRadioToggle: () => void;
  onWatchClick: () => void;
  onTopEvent: (phase: TopPhase) => void;
}) {
  const tint = station.lampTint;
  const glow = { opacity: lampOn ? undefined : 0, transition: "opacity 1.2s ease" };
  const tintTransition = { transition: "fill 1.8s ease-in-out, stop-color 1.8s ease-in-out" };
  return (
    <svg
      className="absolute left-0 h-auto w-full max-md:bottom-[118px] md:bottom-0"
      viewBox={mobile ? "300 40 900 300" : "0 0 1440 340"}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden={false}
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="desk-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a1c" />
          <stop offset="1" stopColor="#1c130c" />
        </linearGradient>
        <linearGradient id="desk-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241811" />
          <stop offset="1" stopColor="#0c0805" />
        </linearGradient>
        <radialGradient id="lamp-pool" cx="0.5" cy="0.35" r="0.65">
          <stop offset="0" stopColor={tint} stopOpacity="0.34" style={tintTransition} />
          <stop offset="0.55" stopColor={tint} stopOpacity="0.1" style={tintTransition} />
          <stop offset="1" stopColor={tint} stopOpacity="0" style={tintTransition} />
        </radialGradient>
        <linearGradient id="wood-grain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a3520" stopOpacity="0" />
          <stop offset="0.5" stopColor="#4a3520" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4a3520" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* desk surface, seen from just behind */}
      <path d="M-20 150 L1460 150 L1460 210 L-20 210 Z" fill="url(#desk-top)" />
      <path d="M-20 210 L1460 210 L1460 345 L-20 345 Z" fill="url(#desk-face)" />
      {[162, 174, 187, 199].map((y, i) => (
        <rect key={i} x={80 + i * 60} y={y} width={1200 - i * 90} height="1.2" fill="url(#wood-grain)" opacity="0.6" />
      ))}
      <rect x="-20" y="208" width="1480" height="2.5" fill="#5c4326" opacity="0.5" />

      {/* lamp light pool over everything on the desk */}
      <g style={glow}>
        <ellipse cx="470" cy="160" rx="430" ry="150" fill="url(#lamp-pool)"
          style={{ animation: "tars-flicker 11s steps(1) infinite" }} />
      </g>

      {/* ---- desk lamp, left (click = on/off) ---- */}
      <g
        key={`lamp-${shockKey}`}
        style={{
          transformOrigin: "300px 150px",
          animation: shockKey ? "tars-lamp-swing 3.2s ease-out" : undefined,
        }}
      >
      <g
        onClick={onLampToggle}
        onKeyDown={(e) => e.key === "Enter" && onLampToggle()}
        role="button"
        tabIndex={0}
        aria-label={lampOn ? "Desk lamp — turn off" : "Desk lamp — turn on"}
        onMouseDown={(e) => e.preventDefault()}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
      >
        <g
          transform="translate(600 0) scale(-1 1)"
          style={{ animation: lampOn ? "tars-flicker 11s steps(1) infinite" : "none" }}
        >
          <ellipse cx="300" cy="152" rx="52" ry="9" fill="#0a0603" opacity="0.7" />
          <path d="M292 150 L296 92 L303 92 L307 150 Z" fill="#141210" />
          <path d="M299 94 C270 74 252 66 236 68 L232 82 C252 84 272 92 296 106 Z" fill="#181512" />
          <path d="M206 56 L266 56 L286 96 L186 96 Z" fill="#2a2015" />
          <g style={glow}>
            <path d="M206 56 L266 56 L286 96 L186 96 Z" fill={tint} opacity="0.14" style={tintTransition} />
            <ellipse cx="236" cy="94" rx="34" ry="10" fill={tint} opacity="0.85" style={tintTransition} />
            <ellipse cx="236" cy="98" rx="60" ry="20" fill={tint} opacity="0.28" style={tintTransition} />
          </g>
          {/* cold bulb when off */}
          {!lampOn && <ellipse cx="236" cy="94" rx="30" ry="8" fill="#1c1a16" />}
        </g>
      </g>

      </g>

      {/* ---- scattered papers + pencils (they remember the shockwave) ---- */}
      <g
        key={`papers-${shockKey}`}
        style={{
          transformOrigin: "460px 175px",
          animation: shockKey ? "tars-papers-lift 2.6s ease-out" : undefined,
        }}
      >
        <path d="M360 158 L470 152 L482 184 L370 192 Z" fill="#d8cdb4" opacity="0.92" />
        <path d="M368 164 L458 159 M370 172 L462 167 M372 180 L452 176" stroke="#8a7f68" strokeWidth="1" opacity="0.5" fill="none" />
        {/* the Tenet scrawl — a tiny "10" circled on the corner, always there */}
        <g opacity="0.55">
          <text x="466" y="182" fontSize="9" fill="#6a5f48" transform="rotate(-3 466 182)">10</text>
          <ellipse cx="469" cy="179" rx="7" ry="5.5" fill="none" stroke="#6a5f48" strokeWidth="0.7" transform="rotate(-3 466 182)" />
        </g>
        <path d="M448 150 L540 156 L534 186 L442 181 Z" fill="#c9bfa6" opacity="0.9" />
        <path d="M456 160 L524 164 M455 168 L520 172" stroke="#857a62" strokeWidth="1" opacity="0.45" fill="none" />
        <rect x="520" y="188" width="86" height="4.5" rx="2" fill="#b07c3c" transform="rotate(-4 520 188)" />
        <path d="M605 181 l10 1.8 l-9.4 2.7 Z" fill="#e0d0b0" />
        <rect x="368" y="196" width="70" height="4" rx="2" fill="#5c4a68" transform="rotate(3 368 196)" />
      </g>

      {/* ---- the totem ---- */}
      <SpinningTop eternal={station.id === "limbo"} mobile={mobile} onSpin={onTopEvent} />

      {/* ---- small analog radio (click = play/pause) ---- */}
      <g
        onClick={onRadioToggle}
        onKeyDown={(e) => e.key === "Enter" && onRadioToggle()}
        role="button"
        tabIndex={0}
        aria-label={playing ? "Radio — pause" : "Radio — play"}
        onMouseDown={(e) => e.preventDefault()}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
      >
        <ellipse cx="700" cy="156" rx="66" ry="8" fill="#0a0603" opacity="0.6" />
        <rect x="640" y="96" width="120" height="60" rx="8" fill="#2e2118" />
        <rect x="640" y="96" width="120" height="60" rx="8" fill="none" stroke="#4a3722" strokeWidth="1.5" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={652} y={106 + i * 8.6} width="52" height="2.6" rx="1.3" fill="#171008" />
        ))}
        {/* dial — needle position + frequency change with the station */}
        <circle cx="732" cy="118" r="13" fill="#171008" stroke="#c9a86a" strokeWidth="1.2" />
        <line
          x1="732" y1="118"
          x2={732 + 9 * Math.cos((STATIONS.findIndex((s) => s.id === station.id) / 5) * Math.PI + Math.PI)}
          y2={118 + 9 * Math.sin((STATIONS.findIndex((s) => s.id === station.id) / 5) * Math.PI + Math.PI)}
          stroke="#c9a86a" strokeWidth="1.4"
          style={{ transition: "all 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x="700" y="151" textAnchor="middle" fontSize="7.5" fill="#c9a86a" opacity="0.85"
          style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.08em" }}
        >
          {station.radioFrequency}
        </text>
        {/* power light — green pulse when playing, ember when paused */}
        <circle
          cx="722" cy="139" r="1.8"
          fill={playing ? "#4ade80" : "#d94f3c"}
          style={playing ? { animation: "tars-twinkle 1.6s ease-in-out infinite" } : undefined}
        />
        <line x1="752" y1="98" x2="784" y2="54" stroke="#4a3722" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ---- mug, steam (steam only while playing — the room is alive) ---- */}
      <g>
        <ellipse cx="860" cy="158" rx="26" ry="5.5" fill="#0a0603" opacity="0.6" />
        <path d="M840 120 L880 120 L876 158 L844 158 Z" fill="#6e3a30" />
        <path d="M840 120 L880 120 L879 130 L841 130 Z" fill="#7e463a" />
        <path d="M880 126 C894 126 894 144 878 146" fill="none" stroke="#6e3a30" strokeWidth="5" />
        <ellipse cx="860" cy="120" rx="20" ry="4" fill="#2a130e" />
        {/* opacity lives on the group — the shimmer keyframes animate the
            path's own opacity and would override an inline value there */}
        <g style={{ opacity: playing ? 1 : 0, transition: "opacity 1.2s" }}>
          <path
            d="M853 112 C849 104 857 100 853 92"
            stroke="#d8cdb4" strokeWidth="1.5" fill="none" opacity="0.35"
            style={{ animation: "tars-shimmer 7s ease-in-out infinite" }}
          />
          <path
            d="M864 114 C861 107 867 103 864 96"
            stroke="#d8cdb4" strokeWidth="1.2" fill="none" opacity="0.25"
            style={{ animation: "tars-shimmer 9s ease-in-out infinite", animationDelay: "1.6s" }}
          />
        </g>
      </g>

      {/* ---- wristwatch, face up, on station time ---- */}
      <Wristwatch station={station} mobile={mobile} onClick={onWatchClick} />

      {/* ---- stacked books, right ---- */}
      <g>
        <rect x="1050" y="140" width="120" height="12" rx="2" fill="#4a2c28" />
        <rect x="1060" y="128" width="104" height="12" rx="2" fill="#2c3a4a" />
        <rect x="1054" y="116" width="112" height="12" rx="2" fill="#4a4028" />
        <rect x="1070" y="120" width="80" height="1.5" fill="#c9b490" opacity="0.3" />
      </g>

      {/* ---- per-station props ---- */}
      <StationProps activeId={station.id} />
      {station.id === "trinity" && <NeverZero />}
    </svg>
  );
}

/** Bookshelf silhouettes framing left and right edges. */
function Bookshelves({ anomaly }: { anomaly: boolean }) {
  const Shelf = ({ flip = false }: { flip?: boolean }) => (
    <svg
      className={`pointer-events-none absolute top-0 h-full w-[13%] min-w-[90px] max-md:hidden ${
        flip ? "right-0 scale-x-[-1]" : "left-0"
      }`}
      viewBox="0 0 180 900"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden
    >
      <rect width="180" height="900" fill="#050403" />
      <rect x="150" width="30" height="900" fill="#0a0806" />
      {Array.from({ length: 8 }, (_, s) => (
        <g key={s}>
          <rect x="8" y={40 + s * 108} width="150" height="7" fill="#120d08" />
          {Array.from({ length: 9 }, (_, b) => {
            const h = 44 + ((s * 9 + b * 7) % 38);
            const w = 9 + ((s + b * 3) % 8);
            const x = 14 + b * 15.5;
            const tones = ["#181008", "#101418", "#171410", "#0e0c12", "#141008"];
            return (
              <rect
                key={b}
                x={x}
                y={40 + s * 108 - h}
                width={w}
                height={h}
                fill={tones[(s + b) % tones.length]}
              />
            );
          })}
        </g>
      ))}
      <rect x="140" width="20" height="900" fill="#f0b46a" opacity="0.04" />
      {/* five spines in row four read SATOR AREPO TENET OPERA ROTAS */}
      {!flip &&
        ["SATOR", "AREPO", "TENET", "OPERA", "ROTAS"].map((w, i) => {
          const x = 24 + i * 15.5 + 4.5;
          return (
            <text
              key={w}
              x={x}
              y={318}
              fontSize="5"
              fill="#7a6a50"
              opacity="0.5"
              letterSpacing="1.1"
              transform={`rotate(90 ${x} 318)`}
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {w}
            </text>
          );
        })}
      {/* GARGANTUA only, left shelf: a book drops off a shelf — the anomaly.
          It's not random. */}
      {!flip && anomaly && (
        <g
          style={{
            transformOrigin: "100px 330px",
            animation: "tars-book-fall 22s cubic-bezier(0.5,0,0.9,0.6) infinite",
          }}
        >
          <rect x="88" y="318" width="11" height="38" rx="1.5" fill="#5c3a48" />
          <rect x="90" y="324" width="7" height="1.6" fill="#e0d0b0" opacity="0.5" />
        </g>
      )}
    </svg>
  );
  return (
    <>
      <Shelf />
      <Shelf flip />
    </>
  );
}

export function Scene({
  station,
  playing,
  notice,
  onRadioToggle,
  onWatchClick,
  onTopEvent,
  children,
}: {
  station: Station;
  playing: boolean;
  notice: string | null;
  onRadioToggle: () => void;
  onWatchClick: () => void;
  onTopEvent: (phase: TopPhase) => void;
  children?: React.ReactNode;
}) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [lampOn, setLampOn] = useState(true);
  const mobile = useIsMobile();

  /* Trinity: a silent white flash; the shockwave reaches the desk ~40s
     later (papers lift, lamp swings). Repeats every ~2.5 minutes. */
  const [flashKey, setFlashKey] = useState(0);
  const [shockKey, setShockKey] = useState(0);
  useEffect(() => {
    if (station.id !== "trinity") {
      setFlashKey(0);
      setShockKey(0);
      return;
    }
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cycle = () => {
      if (!alive) return;
      setFlashKey(Date.now());
      timers.push(
        setTimeout(() => {
          if (alive) setShockKey(Date.now());
        }, 40_000)
      );
    };
    timers.push(setTimeout(cycle, 25_000));
    const iv = setInterval(cycle, 150_000);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [station.id]);

  /* LIMBO: leaving the tab sinks the room a level; waking takes ~3s. */
  const [sunk, setSunk] = useState(false);
  useEffect(() => {
    if (station.id !== "limbo") {
      setSunk(false);
      return;
    }
    const onVis = () => {
      if (document.hidden) setSunk(true);
      else setTimeout(() => setSunk(false), 1200);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [station.id]);

  /* overflow:hidden still scrolls programmatically (focus/scrollIntoView) —
     pin the room so nothing can shove the composition off-frame */
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    };
    pin();
    el.addEventListener("scroll", pin);
    return () => el.removeEventListener("scroll", pin);
  }, []);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = (e.clientX / window.innerWidth - 0.5) * -10;
      const y = (e.clientY / window.innerHeight - 0.5) * -6;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.04)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="absolute inset-0 overflow-hidden bg-[#06080d]"
      style={{
        filter: sunk ? "brightness(0.5) blur(2px)" : "none",
        transform: sunk ? "translateY(12px) scale(1.015)" : "none",
        transition: "filter 3s ease, transform 3s ease",
      }}
    >
      {/* ---- observation window (upper two thirds) ---- */}
      {/* no filter here — a filter on this container re-resolves its
          %-positioned children against the wrong box and shoves the whole
          window up; the view brightens via the overlay below instead */}
      <div className="tars-window absolute top-[9.5%] bottom-[min(23vw,34%)] md:left-[6%] md:right-[20%] lg:left-[9%] lg:right-[9%] max-md:left-[3%] max-md:right-[3%] max-md:top-[10%] max-md:bottom-[31%]">
        <div className="absolute -inset-[10px] rounded-[26px] border border-[#2a2218] bg-[#0c0a07] shadow-[0_0_80px_rgba(0,0,0,0.8)]" />
        <div className="absolute inset-0 overflow-hidden rounded-[18px]">
          <div
            ref={parallaxRef}
            className="absolute inset-0 will-change-transform"
            style={{ transform: "scale(1.04)", transition: "transform 0.8s ease-out" }}
          >
            {STATIONS.map((s) => (
              <WindowView
                key={s.id}
                variant={s.backgroundVariant}
                active={s.id === station.id}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-0 transition-[background] duration-[1800ms]"
            style={{
              background: `linear-gradient(180deg, transparent 60%, ${station.accentSoft}33 100%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_42%,rgba(232,226,212,0.045)_46%,transparent_50%,transparent_68%,rgba(232,226,212,0.03)_71%,transparent_75%)]" />
          {/* lamp off → the view glows a touch brighter (no filter: see note above) */}
          <div
            className="pointer-events-none absolute inset-0 bg-white mix-blend-soft-light"
            style={{ opacity: lampOn ? 0 : 0.12, transition: "opacity 1.2s ease" }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[18px]">
          <div className="absolute left-1/3 top-0 h-full w-[3px] bg-[#0c0a07] opacity-90" />
          <div className="absolute left-2/3 top-0 h-full w-[3px] bg-[#0c0a07] opacity-90" />
        </div>

        {/* ---- etched signage on the frame's upper edge ---- */}
        <div className="tars-signage absolute -top-[10px] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="rounded-md border border-[#3a2f20] bg-[#0c0a07] px-6 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.7)] max-md:px-4 max-md:py-1.5">
            <h1
              className="text-[26px] font-semibold tracking-[0.42em] text-[#e8dcc3] [text-shadow:0_0_18px_rgba(240,180,106,0.35)] max-md:text-lg"
              style={{ textIndent: "0.42em" }}
            >
              TARS
            </h1>
            <p className="font-mono-tars mt-0.5 whitespace-nowrap text-[10px] tracking-[0.14em] text-[#8a8172] max-md:text-[7.5px] max-md:tracking-[0.1em]">
              DEEP-FOCUS RADIO
              <span className="max-md:hidden"> · MUSIC FOR WORK THAT NEEDS GRAVITY</span>
            </p>
          </div>
        </div>
      </div>

      {/* Trinity flash — one blink of white over everything */}
      {flashKey > 0 && (
        <div
          key={flashKey}
          className="pointer-events-none absolute inset-0 z-20 bg-[#f5efdf]"
          style={{ animation: "tars-flash-once 0.3s ease-out forwards" }}
          aria-hidden
        />
      )}

      {/* GARGANTUA, lamp off: the dust settles into Morse. S T A Y. */}
      {station.id === "no-time-for-caution" && !lampOn && (
        <div
          className="pointer-events-none absolute bottom-[19.5%] left-[31%] z-10 flex items-center gap-[7px]"
          style={{ animation: "tars-dust-settle 4s ease-out 1.5s both" }}
          aria-hidden
        >
          {"... - .- -.--".split("").map((c, i) =>
            c === " " ? (
              <span key={i} className="w-[5px]" />
            ) : (
              <span
                key={i}
                className="rounded-full bg-[#f0d9a8] opacity-70"
                style={{
                  width: c === "-" ? 9 : 3,
                  height: 3,
                  boxShadow: "0 0 4px rgba(240,217,168,0.5)",
                  animation: `tars-twinkle ${3 + (i % 4)}s ease-in-out infinite`,
                }}
              />
            )
          )}
        </div>
      )}

      {/* ---- room ----
          lamp off → the room falls dark while the window stays lit and
          becomes the light source (filter dims only the furniture) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          filter: lampOn ? "none" : "brightness(0.45)",
          transition: "filter 1.2s ease",
        }}
      >
        <Bookshelves anomaly={station.id === "no-time-for-caution"} />
        <Desk
          station={station}
          playing={playing}
          lampOn={lampOn}
          mobile={mobile}
          shockKey={shockKey}
          onLampToggle={() => setLampOn((v) => !v)}
          onRadioToggle={onRadioToggle}
          onWatchClick={onWatchClick}
          onTopEvent={onTopEvent}
        />
        <PinBoard notice={notice} idleText={station.radioFrequency} />
      </div>
      {lampOn && <DustMotes slow={station.id === "no-time-for-caution"} />}

      {/* room-side ambient tint from the active station */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-[background] duration-[1800ms]"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${station.accentColor}14, transparent 70%)`,
        }}
      />

      <div className="tars-grain" />
      <div className="tars-vignette" />

      {children}
    </div>
  );
}

export type { TopPhase };
