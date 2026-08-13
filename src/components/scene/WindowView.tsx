import type { ViewVariant } from "@/data/stations";

/**
 * The six window views. Pure CSS/SVG illustration — no remote assets, no
 * studio IP: every scene is an original composition that evokes the film
 * through generic elements (a ring craft, a pier queue, a test tower, an
 * oared galley) rather than recreating any shot.
 *
 * All views stay mounted so station changes crossfade; inactive views have
 * their animations paused via [data-view-active="false"] in CSS.
 */

/** Deterministic pseudo-random — identical on server and client. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Round to 3 decimals so SSR and client render byte-identical SVG. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function Stars({
  seed,
  count,
  color = "#e8e2d4",
  maxR = 1.1,
  twinkle = true,
}: {
  seed: number;
  count: number;
  color?: string;
  maxR?: number;
  twinkle?: boolean;
}) {
  const rand = seeded(seed);
  const stars = Array.from({ length: count }, (_, i) => ({
    x: r3(rand() * 100),
    y: r3(rand() * 100),
    r: r3(0.25 + rand() * maxR),
    o: r3(0.25 + rand() * 0.75),
    d: r3(2.4 + rand() * 5),
    key: i,
  }));
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {stars.map((s) => (
        <circle
          key={s.key}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.16}
          fill={color}
          opacity={s.o}
          style={
            twinkle
              ? {
                  animation: `tars-twinkle ${s.d}s ease-in-out infinite`,
                  animationDelay: `${(s.key % 17) * 0.31}s`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/* ================= 1 · GARGANTUA — deep space ================= */

function DeepSpace() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_38%_30%,#101c38_0%,#0a1226_45%,#04060f_100%)]">
      <div
        className="absolute -inset-[8%]"
        style={{ animation: "tars-drift 55s linear infinite alternate" }}
      >
        <Stars seed={7} count={170} />
      </div>
      <Stars seed={91} count={70} color="#aebcd8" maxR={0.7} />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id="gg-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.55" stopColor="#f0dcc0" stopOpacity="0" />
            <stop offset="0.72" stopColor="#f0dcc0" stopOpacity="0.28" />
            <stop offset="0.8" stopColor="#f5e6c8" stopOpacity="0.55" />
            <stop offset="0.86" stopColor="#f0dcc0" stopOpacity="0.2" />
            <stop offset="1" stopColor="#f0dcc0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---- the black hole: shadow, lensed halo, tilted accretion disk ---- */}
        <g transform="translate(146 30)">
          {/* soft outer glow */}
          <circle r="26" fill="url(#gg-glow)" opacity="0.35" />
          {/* accretion disk behind (upper arc, lensed light) */}
          <ellipse rx="24" ry="7.5" fill="none" stroke="#f0dcc0" strokeWidth="1.3"
            opacity="0.35" transform="rotate(-12)" />
          {/* the shadow */}
          <circle r="10.5" fill="#020306" />
          {/* photon ring hugging the shadow */}
          <circle r="11.3" fill="none" stroke="#f5e6c8" strokeWidth="0.7" opacity="0.7" />
          {/* disk in front (brighter, crossing the lower half) */}
          <path d="M-24 4 C-14 8.5 14 8.5 24 3.4" fill="none" stroke="#f5e6c8"
            strokeWidth="2.2" opacity="0.65" strokeLinecap="round" />
          <path d="M-22 5.5 C-12 10 12 10 22 4.8" fill="none" stroke="#e0b070"
            strokeWidth="1" opacity="0.35" strokeLinecap="round" />
        </g>

        {/* ---- ring craft: twelve modules on a hub, slowly rotating ---- */}
        <g transform="translate(52 34)">
          <g style={{ animation: "tars-rotate 180s linear infinite" }}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6;
              return (
                <rect
                  key={i}
                  x="-1.9"
                  y="-9.6"
                  width="3.8"
                  height="3"
                  rx="0.5"
                  fill="#aeb8c8"
                  transform={`rotate(${i * 30}) `}
                  opacity={0.8}
                />
              );
            })}
            {/* connecting ring + spokes + hub */}
            <circle r="8" fill="none" stroke="#9aa6bc" strokeWidth="0.7" opacity="0.8" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#9aa6bc" strokeWidth="0.6" opacity="0.7" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#9aa6bc" strokeWidth="0.6" opacity="0.7" />
            <circle r="1.7" fill="#cfd6e4" />
          </g>
          {/* tiny window lights on modules */}
          <circle cx="0" cy="-8.1" r="0.28" fill="#f0dcc0">
            <animate attributeName="opacity" values="1;0.4;1" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ---- small ice planet, lower left ---- */}
        <g transform="translate(26 76)">
          <circle r="7" fill="#12203a" />
          {/* lit crescent facing the black hole */}
          <path d="M4.5 -5.4 A7 7 0 0 1 4.5 5.4 A5.4 5.4 0 0 0 4.5 -5.4 Z" fill="#7a94b8" opacity="0.5" />
          <ellipse cx="-1" cy="-1.5" rx="3.4" ry="1.1" fill="#2c3f60" opacity="0.7" transform="rotate(-16)" />
          <ellipse cx="0.5" cy="2" rx="2.8" ry="0.9" fill="#2c3f60" opacity="0.5" transform="rotate(-10)" />
        </g>
      </svg>

      {/* occasional shooting star */}
      <div
        className="absolute right-[8%] top-[14%] h-[1.5px] w-24 origin-right rounded-full bg-gradient-to-l from-white/90 to-transparent"
        style={{ animation: "tars-shooting-star 23s linear infinite" }}
      />
    </div>
  );
}

/* ================= 2 · THE MOLE — grey dawn sea ================= */

function DawnSea() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#6d7a7d_0%,#8b968f_34%,#5c6b6a_52%,#39494c_66%,#22303a_100%)]">
      {/* pale sun behind haze */}
      <div
        className="absolute left-[58%] top-[22%] h-[16%] w-[10%] rounded-full opacity-60"
        style={{
          background: "radial-gradient(closest-side, rgba(233,226,204,0.8), transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <rect x="0" y="52" width="200" height="1" fill="#2c3a3e" opacity="0.7" />

        {/* ---- destroyer on the horizon, listing smoke ---- */}
        <g fill="#25333a">
          <path d="M120 51.8 h26 l-2.4 -3.4 h-9 l-1 -1.6 h-6 l-1 1.6 h-4.6 Z" />
          <rect x="128" y="45.4" width="1.4" height="3" />
          <rect x="133" y="44.6" width="1.1" height="3.8" />
          <rect x="138.5" y="46.2" width="0.9" height="2.4" />
        </g>
        <path d="M133.5 44.5 c-1.6 -4 1.6 -7 0.6 -11 c3 3.2 2 7.4 1 11 Z" fill="#3a4547" opacity="0.55" />
        {[0, 1, 2].map((i) => (
          <circle
            key={`smoke-${i}`}
            cx="134.3"
            cy="34"
            r={1.4 + i * 0.4}
            fill="#3a4547"
            opacity="0"
            style={{
              animation: `tars-smoke ${5 + i * 1.6}s linear infinite`,
              animationDelay: `${-i * 2.1}s`,
            }}
          />
        ))}
        {/* a little ship steadily crossing, right to left */}
        <g style={{ animation: "tars-sail 48s linear infinite", animationDelay: "-18s" }}>
          <g fill="#25333a" transform="translate(215 0)">
            <path d="M0 51.9 h9 l-1.2 -2.2 h-6.6 Z" />
            <rect x="3.6" y="47.8" width="0.9" height="2" />
            <path d="M4 47.6 c-0.7 -1.8 0.7 -3.2 0.3 -5 c1.4 1.5 0.9 3.4 0.5 5 Z" fill="#3a4547" opacity="0.6" />
          </g>
        </g>
        {/* little ships — the civilian boats, coming */}
        <g fill="#2c3a40">
          <path d="M162 51.9 h6 l-0.8 -1.5 h-4.4 Z" />
          <rect x="164.5" y="49" width="0.6" height="1.4" />
          <path d="M176 51.9 h5 l-0.7 -1.3 h-3.6 Z" />
          <path d="M186 51.9 h4.4 l-0.6 -1.1 h-3.2 Z" />
        </g>

        {/* ---- the mole: a long pier reaching to sea, men queued along it ---- */}
        <g>
          <path d="M0 78 L112 53.6 L114 54.6 L4 82.5 Z" fill="#1b262b" />
          <path d="M0 78 L112 53.6 L112.6 53.9 L1.5 79.6 Z" fill="#31404a" opacity="0.8" />
          {/* pilings */}
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const x = 8 + t * 100;
            const y = 79.2 - t * 24.2;
            const h = 3.2 - t * 2.1;
            return <rect key={i} x={x} y={y} width={0.9 - t * 0.5} height={h} fill="#141c20" />;
          })}
          {/* the queue — helmeted men, shrinking toward the sea; it shuffles */}
          <g style={{ animation: "tars-queue-shuffle 11s ease-in-out infinite" }}>
          {Array.from({ length: 16 }, (_, i) => {
            const t = i / 15;
            const x = 10 + t * 96 + (i % 3) * 0.8;
            const y = 76.2 - t * 23.2;
            const h = 4.6 - t * 3.1;
            const w = 1.5 - t * 0.95;
            return (
              <g key={i} fill="#10181c">
                <rect x={x} y={y - h} width={w} height={h} rx={w / 2.5} />
                <circle cx={x + w / 2} cy={y - h - w * 0.42} r={w * 0.62} />
              </g>
            );
          })}
          </g>
        </g>

        {/* wave bands */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x="0"
            y={r3(57 + i * 5.4)}
            width="200"
            height="0.35"
            fill="#c7cfc2"
            opacity={r3(0.05 + i * 0.011)}
            style={{
              animation: `tars-shimmer ${7 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </svg>

      {/* two spitfires crossing, one trailing the other */}
      <svg
        className="absolute right-[6%] top-[24%] w-[4.5%] opacity-0"
        viewBox="0 0 40 16"
        aria-hidden
        style={{ animation: "tars-flyby 47s linear infinite" }}
      >
        <g fill="#2e3c40">
          <ellipse cx="20" cy="9" rx="12" ry="1.8" />
          <path d="M17 9 L10 3 L14 3 L21 8 Z" />
          <path d="M19 9 L26 14 L23 14 L17 10 Z" />
          <path d="M31 8 L35 5.5 L35 10 Z" />
        </g>
      </svg>
      <svg
        className="absolute right-[2%] top-[29%] w-[3.5%] opacity-0"
        viewBox="0 0 40 16"
        aria-hidden
        style={{ animation: "tars-flyby 47s linear infinite", animationDelay: "1.1s" }}
      >
        <g fill="#2e3c40" opacity="0.85">
          <ellipse cx="20" cy="9" rx="12" ry="1.8" />
          <path d="M17 9 L10 3 L14 3 L21 8 Z" />
          <path d="M19 9 L26 14 L23 14 L17 10 Z" />
          <path d="M31 8 L35 5.5 L35 10 Z" />
        </g>
      </svg>

      {/* low cloud bank drifting */}
      <div
        className="absolute left-0 top-[30%] h-[18%] w-[140%] opacity-45"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(120,132,130,0.55) 45%, transparent)",
          animation: "tars-drift 90s linear infinite alternate",
        }}
      />
    </div>
  );
}

/* ================= 3 · TRINITY — desert night ================= */

function DesertNight() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0d12_0%,#14131a_42%,#241a17_66%,#3a2318_100%)]">
      <Stars seed={41} count={90} color="#d8cfc0" maxR={0.8} />
      {/* the glow at the tower — breathing, waiting */}
      <div
        className="absolute bottom-[26%] left-[36%] h-[12%] w-[22%] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(240,160,70,0.6), rgba(240,140,60,0.12) 55%, transparent 75%)",
          filter: "blur(5px)",
          animation: "tars-flicker 9s steps(1) infinite",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* far mesas */}
        <path
          d="M0 70 L18 70 L24 62 L52 62 L58 70 L92 70 L98 64 L124 64 L130 70 L200 70 L200 100 L0 100 Z"
          fill="#191411"
        />
        {/* distant base camp lights */}
        {[26, 31, 35, 42, 47].map((x, i) => (
          <rect key={i} x={x} y={68.6} width="0.7" height="0.5" fill="#e0b070"
            opacity="0.7"
            style={{ animation: `tars-twinkle ${3 + i}s ease-in-out infinite` }} />
        ))}

        {/* ---- the shot tower, prominent, catching the glow ---- */}
        <g stroke="#0e0b09" fill="none">
          <path d="M95 70 L91 40 M95 70 L99 40 M91 40 L99 40" strokeWidth="1.4" />
          <path d="M91.8 46 L98.2 46 M92.6 52 L97.4 52 M93.2 58 L96.8 58 M93.8 64 L96.2 64" strokeWidth="0.9" />
          <path d="M91 40 L95 34 L99 40" strokeWidth="1.2" />
          {/* the device housing, faint amber edge */}
          <rect x="93.4" y="35.4" width="3.2" height="4" fill="#141008" stroke="#d99a4e" strokeWidth="0.28" strokeOpacity="0.7" />
        </g>

        {/* near mesas */}
        <path
          d="M0 82 L30 82 L40 72 L74 72 L82 82 L136 82 L146 74 L170 74 L178 82 L200 82 L200 100 L0 100 Z"
          fill="#0d0a08"
        />

        {/* ---- observation trench, bottom right: three watchers, backs to us ---- */}
        <g fill="#080604">
          <path d="M150 100 L152 88 L196 88 L198 100 Z" />
          {/* welder-glass silhouettes peering over the lip */}
          {[160, 172, 184].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 88 q3 -6 6 0 Z`} />
              {/* goggle glint */}
              <rect x={x + 2.1} y={84.7} width="1.8" height="0.55" rx="0.27" fill="#e8b060"
                opacity="0.8"
                style={{ animation: `tars-twinkle ${5 + i * 2}s ease-in-out infinite` }} />
            </g>
          ))}
        </g>
      </svg>
      {/* wind-blown dust, always moving */}
      <div
        className="absolute bottom-[18%] left-0 h-[9%] w-[150%] opacity-45"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(216,154,78,0.28) 30%, transparent 55%, rgba(216,154,78,0.18) 80%, transparent)",
          filter: "blur(3px)",
          animation: "tars-drift 16s linear infinite alternate", animationDelay: "-6s",
        }}
      />
      {/* storm light, very occasional */}
      <div
        className="absolute inset-0 bg-[#f0dcc0] opacity-0"
        style={{ animation: "tars-flicker 17s steps(1) infinite reverse", mixBlendMode: "soft-light" }}
      />
    </div>
  );
}

/* ================= 4 · THE ALGORITHM — inverted city ================= */

function InvertedCity() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#0c1e22_0%,#123036_38%,#0a1a1f_52%,#061114_100%)]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="tnt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c5a5e" />
            <stop offset="1" stopColor="#123036" />
          </linearGradient>
          <linearGradient id="tnt-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c2483c" stopOpacity="0.5" />
            <stop offset="1" stopColor="#c2483c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tnt-blue" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3c78c2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#3c78c2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="50" fill="url(#tnt-sky)" opacity="0.5" />

        {/* temporal pincer — a red edge moving forward, a blue edge inverted */}
        <rect x="8" y="0" width="7" height="46" fill="url(#tnt-red)" opacity="0.6"
          style={{ animation: "tars-twinkle 11s ease-in-out infinite" }} />
        <rect x="186" y="4" width="7" height="46" fill="url(#tnt-blue)" opacity="0.6"
          style={{ animation: "tars-twinkle 13s ease-in-out infinite", animationDelay: "5.5s" }} />

        {/* skyline hanging DOWN from the top — the inversion */}
        <g fill="#0e2226">
          <rect x="12" y="0" width="9" height="26" />
          <rect x="25" y="0" width="14" height="34" />
          <rect x="43" y="0" width="7" height="20" />
          <rect x="56" y="0" width="12" height="42" />
          <rect x="72" y="0" width="9" height="28" />
          <rect x="88" y="0" width="16" height="38" />
          <rect x="110" y="0" width="8" height="24" />
          <rect x="122" y="0" width="13" height="46" />
          <rect x="140" y="0" width="10" height="30" />
          <rect x="156" y="0" width="15" height="36" />
          <rect x="176" y="0" width="9" height="22" />
        </g>
        {/* a tower crane hanging into the sky */}
        <g stroke="#0e2226" strokeWidth="1" fill="none">
          <line x1="148" y1="0" x2="148" y2="18" />
          <line x1="140" y1="14" x2="160" y2="14" />
          <line x1="148" y1="0" x2="140" y2="14" />
          <line x1="148" y1="0" x2="160" y2="14" />
          <line x1="156" y1="14" x2="156" y2="19" strokeWidth="0.5" />
        </g>
        {/* lit windows on the hanging towers */}
        <g fill="#7fd8d0" opacity="0.7">
          {[
            [28, 8], [33, 14], [59, 20], [63, 33], [92, 12], [97, 27],
            [125, 18], [130, 38], [159, 10], [163, 24], [30, 26], [61, 8],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="0.9"
              height="1.3"
              style={{
                animation: `tars-twinkle ${4 + (i % 5)}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </g>

        {/* still water below, faint upright reflection */}
        <rect x="0" y="50" width="200" height="50" fill="#08181c" />
        <g fill="#12363c" opacity="0.5" transform="translate(0,100) scale(1,-1)">
          <rect x="25" y="0" width="14" height="17" />
          <rect x="56" y="0" width="12" height="21" />
          <rect x="88" y="0" width="16" height="19" />
          <rect x="122" y="0" width="13" height="23" />
          <rect x="156" y="0" width="15" height="18" />
        </g>

        {/* ---- two figures: one stands on the water, its twin hangs above ---- */}
        <g fill="#061417">
          <g>
            <rect x="103.2" y="55.5" width="1.7" height="5.2" rx="0.8" />
            <circle cx="104" cy="54.8" r="0.95" />
          </g>
          <g transform="translate(0,100) scale(1,-1)" opacity="0.85">
            <rect x="103.2" y="151.2" width="1.7" height="5.2" rx="0.8" />
            <circle cx="104" cy="150.5" r="0.95" />
          </g>
          <ellipse cx="104" cy="61.2" rx="3.2" ry="0.5" fill="#5fb3ad" opacity="0.18" />
        </g>

        {/* inverted rain — falls upward, constantly */}
        {[24, 52, 78, 102, 132, 162, 186].map((x, i) => (
          <rect
            key={`rain-${i}`}
            x={x}
            y="30"
            width="0.55"
            height="8"
            fill="#8fe4dc"
            opacity="0"
            style={{
              animation: `tars-rain-up ${2.4 + (i % 4) * 0.7}s linear infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x="0"
            y={54 + i * 7}
            width="200"
            height="0.3"
            fill="#5fb3ad"
            opacity="0.05"
            style={{
              animation: `tars-shimmer ${9 + i}s ease-in-out infinite`,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ================= 5 · LIMBO — dream city ================= */

function DreamLimbo() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#3a3040_0%,#5c4638_38%,#8a5f42_62%,#3d2c26_100%)]">
      {/* dusk sun */}
      <div
        className="absolute left-[40%] top-[34%] h-[22%] w-[14%] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, rgba(240,200,140,0.9), rgba(240,180,110,0.25) 60%, transparent 75%)",
          filter: "blur(3px)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ animation: "tars-fold 26s ease-in-out infinite" }}
      >
        {/* ---- the fold: city curling up and OVER at both top corners ---- */}
        <g fill="#1f1a18">
          <path d="M0 34 C14 30 24 20 28 4 L36 6 C31 24 18 36 2 40 Z" />
          {/* buildings standing on the curl, tilting inward */}
          <g>
            <rect x="6" y="24" width="4" height="12" transform="rotate(-18 8 30)" />
            <rect x="13" y="15" width="4.5" height="13" transform="rotate(-32 15 21)" />
            <rect x="21" y="7" width="4" height="12" transform="rotate(-48 23 13)" />
            <rect x="28" y="2" width="3.6" height="10" transform="rotate(-64 30 7)" />
          </g>
          <path d="M200 30 C186 26 176 17 172 2 L164 4 C169 21 182 32 198 36 Z" />
          <g>
            <rect x="190" y="21" width="4" height="12" transform="rotate(18 192 27)" />
            <rect x="182" y="12" width="4.5" height="13" transform="rotate(32 184 18)" />
            <rect x="174" y="5" width="4" height="11" transform="rotate(48 176 10)" />
          </g>
        </g>

        {/* crumbling cliff-towers at the horizon */}
        <g fill="#2c2320" opacity="0.95">
          <path d="M0 62 L0 38 L7 36 L11 46 L15 44 L18 62 Z" />
          <path d="M18 62 L20 42 L27 40 L30 50 L34 48 L36 62 Z" />
          <path d="M182 62 L184 44 L190 42 L193 34 L200 32 L200 62 Z" />
        </g>

        {/* mid skyline — and the city still grows the longer you stay */}
        <g fill="#33241e">
          <rect x="40" y="50" width="7" height="12" />
          <rect x="50" y="46" width="10" height="16" />
          <rect x="64" y="52" width="6" height="10" />
          <rect x="120" y="48" width="9" height="14" />
          <rect x="133" y="52" width="6" height="10" />
          <rect x="144" y="45" width="11" height="17" />
          {/* dream construction: appears after 3, 8 and 15 minutes on-station */}
          <rect x="76" y="47" width="8" height="15" opacity="0"
            style={{ animation: "tars-fade-in 20s ease-out 180s forwards" }} />
          <rect x="94" y="44" width="10" height="18" opacity="0"
            style={{ animation: "tars-fade-in 20s ease-out 480s forwards" }} />
          <rect x="110" y="49" width="6" height="13" opacity="0"
            style={{ animation: "tars-fade-in 20s ease-out 900s forwards" }} />
        </g>

        {/* shoreline */}
        <rect x="0" y="62" width="200" height="38" fill="#241b18" />
        {/* ---- two figures on the shore, sitting together, watching ---- */}
        <g fill="#171210">
          <path d="M88 66.5 q1.3 -3.4 2.6 0 Z" />
          <circle cx="89.3" cy="63.4" r="0.8" />
          <path d="M91.6 66.5 q1.2 -3 2.4 0 Z" />
          <circle cx="92.8" cy="63.8" r="0.72" />
        </g>
        {/* dream embers drifting up off the shore, constant */}
        {[30, 62, 98, 128, 158, 176].map((x, i) => (
          <circle
            key={`ember-${i}`}
            cx={x}
            cy={72 + (i % 3) * 6}
            r="0.7"
            fill="#e8bc80"
            opacity="0"
            style={{
              ["--mote-dx" as string]: `${((i % 3) - 1) * 8}px`,
              ["--mote-dy" as string]: "-22px",
              ["--mote-max" as string]: 0.85,
              animation: `tars-mote ${4.5 + (i % 4) * 1.5}s linear infinite`,
              animationDelay: `${-i * 1.4}s`,
            }}
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <rect
            key={i}
            x="0"
            y={68 + i * 6.4}
            width="200"
            height="0.4"
            fill="#c9a86a"
            opacity="0.12"
            style={{
              animation: `tars-shimmer ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 1.1}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ================= 6 · WINE-DARK SEA — the long way home ================= */

function WineDarkSea() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0810_0%,#1c0e1a_40%,#2e1220_58%,#180a12_100%)]">
      <Stars seed={23} count={120} color="#e0d4c0" maxR={0.9} />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* constellations — hand-drawn */}
        <g stroke="#c9b490" strokeWidth="0.18" opacity="0.5" fill="#e8dcc3">
          <path d="M30 14 L38 18 L46 15 L52 22 L60 20" fill="none" />
          {[[30, 14], [38, 18], [46, 15], [52, 22], [60, 20]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.7" />
          ))}
          {/* this one spends the hour becoming a drawn bow */}
          <g style={{ animation: "tars-fade-out-slow 3600s linear forwards" }}>
            <path d="M138 10 L144 16 L152 14 L156 8" fill="none" />
            {[[138, 10], [144, 16], [152, 14], [156, 8]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.7" />
            ))}
          </g>
          <g style={{ opacity: 0, animation: "tars-fade-in-slow 3600s linear forwards" }}>
            {/* the great bow, strung and nocked */}
            <path d="M139 6 C147 9 147 17 139 20" fill="none" />
            <path d="M139 6 L139 20" fill="none" strokeWidth="0.14" />
            <path d="M139 13 L152 13" fill="none" strokeWidth="0.14" />
            {[[139, 6], [145, 8.4], [146.6, 13], [145, 17.6], [139, 20], [152, 13]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.7" />
            ))}
          </g>
        </g>

        {/* low moon + its path on the water */}
        <circle cx="168" cy="30" r="7" fill="#e8dcc3" opacity="0.85" />
        <circle cx="165.8" cy="28.6" r="1.6" fill="#c9b490" opacity="0.4" />
        <circle cx="170.4" cy="32.4" r="1" fill="#c9b490" opacity="0.35" />

        {/* sea */}
        <rect x="0" y="52" width="200" height="48" fill="#160a14" />
        <path d="M162 52 L174 52 L178 100 L156 100 Z" fill="#c9b490" opacity="0.07" />

        {/* ---- siren rocks, starboard — jagged, wrong, beautiful ---- */}
        <g fill="#0c0510">
          <path d="M186 52.4 L189 40 L193 46 L196 36 L200 44 L200 52.6 Z" />
          <path d="M176 52.3 L179 45 L182.5 52.3 Z" />
          {/* a pale glimmer on the rocks that isn't moonlight */}
          <circle cx="192.5" cy="44" r="0.5" fill="#d8a8b8" opacity="0.5"
            style={{ animation: "tars-twinkle 7s ease-in-out infinite" }} />
        </g>

        {/* ---- the galley: high curved prow, square sail, banked oars ---- */}
        <g
          style={{
            animation: "tars-bob 7s ease-in-out infinite",
            transformOrigin: "78px 54px",
          }}
        >
        <g transform="translate(78 54) scale(0.62)">
          {/* hull */}
          <path d="M-30 1 C-18 6.5 18 6.5 28 0.5 L24 5.5 C12 9.5 -14 9.5 -26 5 Z" fill="#0d0509" />
          {/* high stern + prow curling like a wave */}
          <path d="M-30 1 C-33 -2 -33 -6 -30.5 -8.5 C-31.5 -4.5 -30.5 -2.5 -28.5 0.2 Z" fill="#0d0509" />
          <path d="M28 0.5 C32 -2.5 33 -7.5 30.5 -11 C33.5 -8.5 34.5 -3 30 1.5 Z" fill="#0d0509" />
          {/* painted eye at the prow — ships had them */}
          <circle cx="24.5" cy="-1.6" r="0.75" fill="#c9b490" opacity="0.8" />
          <circle cx="24.7" cy="-1.6" r="0.32" fill="#0d0509" />
          {/* mast + yard + square sail, gently full */}
          <rect x="-1.5" y="-24" width="1.2" height="24" fill="#0d0509" />
          <rect x="-11" y="-23.6" width="20.5" height="1" rx="0.5" fill="#0d0509" />
          <path d="M-10 -22.5 L9.5 -22.5 C9 -14.5 9.5 -9.5 10.5 -4.5 L-11 -4.5 C-10 -9.5 -9.5 -14.5 -10 -22.5 Z"
            fill="#241018" stroke="#3e1c26" strokeWidth="0.4" />
          {/* sail stripe */}
          <rect x="-10.2" y="-15" width="20.2" height="2.2" fill="#9c4a52" opacity="0.5" />
          {/* rigging */}
          <path d="M-10 -22.5 L-26 4 M9.5 -22.5 L24 0" stroke="#241018" strokeWidth="0.35" fill="none" />
          {/* oars, banked and biting the water */}
          {Array.from({ length: 7 }, (_, i) => {
            const x = -22 + i * 7;
            return (
              <line
                key={i}
                x1={x} y1={4.4} x2={x - 3.4} y2={11.5}
                stroke="#0d0509" strokeWidth="0.55"
              />
            );
          })}
          {/* ---- the wanderer at the prow, bow in hand, watching for home ---- */}
          <g fill="#0d0509">
            <rect x="20.2" y="-8.6" width="1.6" height="5.4" rx="0.7" />
            <circle cx="21" cy="-9.4" r="0.9" />
            {/* the great bow, strung */}
            <path d="M22.6 -10.6 C24.6 -8.6 24.6 -4.6 22.6 -2.6" fill="none" stroke="#0d0509" strokeWidth="0.5" />
            <line x1="22.6" y1="-10.6" x2="22.6" y2="-2.6" stroke="#0d0509" strokeWidth="0.28" />
          </g>
          {/* oar-lamp glow on the waterline */}
          <ellipse cx="0" cy="7.4" rx="24" ry="2" fill="#d99a4e" opacity="0.1">
            <animate attributeName="opacity" values="0.1;0.18;0.1" dur="7s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="14" cy="1.8" r="0.5" fill="#f0b46a" opacity="0.9" />
          <circle cx="-16" cy="2.2" r="0.45" fill="#f0b46a" opacity="0.75" />
        </g>
        </g>

        {/* moon path + drift lines */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x="0"
            y={r3(55 + i * 4.4)}
            width="200"
            height="0.35"
            fill="#9c4a52"
            opacity={r3(0.07 + i * 0.008)}
            style={{
              animation: `tars-shimmer ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const VIEWS: Record<ViewVariant, () => React.ReactElement> = {
  "deep-space": DeepSpace,
  "dawn-sea": DawnSea,
  "desert-night": DesertNight,
  "inverted-city": InvertedCity,
  "dream-limbo": DreamLimbo,
  "wine-dark-sea": WineDarkSea,
};

export function WindowView({
  variant,
  active,
}: {
  variant: ViewVariant;
  active: boolean;
}) {
  const View = VIEWS[variant];
  return (
    <div
      data-view-active={active}
      aria-hidden={!active}
      className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
      style={{ opacity: active ? 1 : 0 }}
    >
      <View />
    </div>
  );
}
