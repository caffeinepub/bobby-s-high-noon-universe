import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const COMPLIMENTS = [
  "Bobby, your energy is measurable from SPACE. Scientists are concerned.",
  "If vibes were currency, Bobby would be restructuring the global economy.",
  "Bobby radiates the frequency of a perfect golden hour. Always.",
  "Historians will debate which era was more defining: the Renaissance or Bobby's Summer of 2023.",
  "Bobby's casual confidence has been classified as a renewable energy source.",
  "There are two types of people in this world: Bobby, and everyone still catching up.",
  "Bobby entered the patio. The patio improved immediately.",
  "Scientists studying Bobby's vibe index have simply started calling it 'The Bobby'.",
  "Bobby doesn't chase summer. Summer shows up early to impress Bobby.",
  "Bobby once recommended a seltzer flavor. It sold out in three states.",
  "The moon comes out earlier on days Bobby is outside. Coincidence? No.",
  "Bobby's presence at a gathering has been scientifically linked to a 340% increase in general goodness.",
  "A Bobby Energy Meter reading of 100% has never been survived by standard measurement equipment.",
  "Bobby is the reason the phrase 'effortlessly cool' was invented.",
  "Bobby's aura has been described as 'warm, golden, and vaguely cinematic' by seven separate witnesses.",
  "Bobby once stared at a can of High Noon for 12 seconds. It started tasting better.",
  "Physics doesn't apply to Bobby's vibe radius. Confirmed by three separate universities.",
];

const AWARDS = [
  {
    emoji: "🏆",
    title: "MOST LIKELY TO ARRIVE WITH ELITE VIBES",
    desc: "Witnesses report the air smelled like confidence and sunscreen",
  },
  {
    emoji: "👑",
    title: "SUPREME COMMISSIONER OF SUMMER",
    desc: "Held office continuously since the first warm day",
  },
  {
    emoji: "🎯",
    title: "GRANDMASTER OF CASUAL EXCELLENCE",
    desc: "Makes everything look effortless. It is not effortless.",
  },
  {
    emoji: "🥇",
    title: "PLATINUM NOON ENTHUSIAST",
    desc: "Consumption metrics off the charts. Completely sustainable.",
  },
  {
    emoji: "✨",
    title: "CERTIFIED MAIN CHARACTER",
    desc: "The universe genuinely rotates around his general area",
  },
  {
    emoji: "🌅",
    title: "GOLDEN HOUR GUARDIAN",
    desc: "Has never once been early to a sunset. Always perfectly on time.",
  },
  {
    emoji: "🎪",
    title: "PREMIER PATIO PHILOSOPHER",
    desc: "Deep thoughts, shallow pool. Perfect conditions.",
  },
  {
    emoji: "🚀",
    title: "INTERGALACTIC VIBE AMBASSADOR",
    desc: "Spreading noon energy to places that don't even have suns yet",
  },
];

interface CanStar {
  id: number;
  x: number;
  y: number;
  lore: string;
  constellation: string;
}

const CAN_STARS: CanStar[] = [
  {
    id: 0,
    x: 12,
    y: 22,
    lore: "First achieved maximum patio charisma on a Tuesday at 3:47pm",
    constellation: "The Sips Major",
  },
  {
    id: 1,
    x: 22,
    y: 32,
    lore: "Legend says Bobby can open a High Noon with pure confidence alone",
    constellation: "The Sips Major",
  },
  {
    id: 2,
    x: 31,
    y: 18,
    lore: "Witnessed by 14 confused but supportive friends",
    constellation: "The Sips Major",
  },
  {
    id: 3,
    x: 40,
    y: 30,
    lore: "Site of the Great Lime Treaty of Summer '23",
    constellation: "The Sips Major",
  },
  {
    id: 4,
    x: 48,
    y: 18,
    lore: "Bobby once stared at a sunset for 45 minutes straight. Nobody dared interrupt.",
    constellation: "The Sips Major",
  },
  {
    id: 5,
    x: 52,
    y: 50,
    lore: "Certified Vibe Coordinates: 35.6°N, 97.5°W",
    constellation: "Bobby's Belt",
  },
  {
    id: 6,
    x: 62,
    y: 48,
    lore: "Here Bobby invented the signature 'casual excellence' hand gesture",
    constellation: "Bobby's Belt",
  },
  {
    id: 7,
    x: 72,
    y: 52,
    lore: "Known for the highest Nooner-per-hour ratio ever recorded",
    constellation: "Bobby's Belt",
  },
  {
    id: 8,
    x: 75,
    y: 18,
    lore: "Bobby said 'this slaps' here for the first time. A tear was shed.",
    constellation: "The Lime Way",
  },
  {
    id: 9,
    x: 83,
    y: 28,
    lore: "Peak can stacking incident of '22 occurred at this exact location",
    constellation: "The Lime Way",
  },
  {
    id: 10,
    x: 89,
    y: 17,
    lore: "Scientists detected an anomalous wave of 'main character energy' here in 2023",
    constellation: "The Lime Way",
  },
  {
    id: 11,
    x: 26,
    y: 70,
    lore: "Nooner's Nebula: where Bobby's most profound thoughts about lime flavor were born",
    constellation: "Nooner's Nebula",
  },
];

const CONSTELLATION_LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
  [6, 7],
  [8, 9],
  [9, 10],
  [11, 1],
  [11, 3],
];

const CONSTELLATION_LABELS = [
  { name: "The Sips Major", x: 30, y: 8 },
  { name: "Bobby's Belt", x: 62, y: 39 },
  { name: "The Lime Way", x: 83, y: 8 },
  { name: "Nooner's Nebula", x: 20, y: 60 },
];

const BOBBY_LEVELS = [
  { min: 0, max: 24, label: "Mildly Bobby", color: "#FF4D7A", emoji: "🌙" },
  { min: 25, max: 49, label: "Peak Patio Bobby", color: "#FFA43A", emoji: "☀️" },
  {
    min: 50,
    max: 74,
    label: "Sunset Emperor Bobby",
    color: "#F7C85A",
    emoji: "🌅",
  },
  {
    min: 75,
    max: 100,
    label: "Astral Noon Bobby",
    color: "#35E6D5",
    emoji: "⚡",
  },
];

interface HeroCan {
  top: string;
  left?: string;
  right?: string;
  size: number;
  rotation: number;
  animDelay: string;
  animDuration: string;
  parallaxSpeed: number;
}

const HERO_CANS: HeroCan[] = [
  {
    top: "12%",
    left: "5%",
    size: 1.5,
    rotation: -15,
    animDelay: "0s",
    animDuration: "6s",
    parallaxSpeed: 22,
  },
  {
    top: "20%",
    right: "7%",
    size: 1.7,
    rotation: 20,
    animDelay: "1s",
    animDuration: "7.5s",
    parallaxSpeed: -18,
  },
  {
    top: "58%",
    left: "4%",
    size: 1.1,
    rotation: 35,
    animDelay: "2s",
    animDuration: "5s",
    parallaxSpeed: 28,
  },
  {
    top: "52%",
    right: "5%",
    size: 1.3,
    rotation: -28,
    animDelay: "0.5s",
    animDuration: "8s",
    parallaxSpeed: -22,
  },
  {
    top: "8%",
    left: "33%",
    size: 0.9,
    rotation: 12,
    animDelay: "1.5s",
    animDuration: "9s",
    parallaxSpeed: 10,
  },
  {
    top: "72%",
    right: "18%",
    size: 1.0,
    rotation: -42,
    animDelay: "3s",
    animDuration: "6.5s",
    parallaxSpeed: -14,
  },
  {
    top: "38%",
    left: "16%",
    size: 0.75,
    rotation: 50,
    animDelay: "2.5s",
    animDuration: "7s",
    parallaxSpeed: 18,
  },
  {
    top: "28%",
    right: "23%",
    size: 0.65,
    rotation: -60,
    animDelay: "4s",
    animDuration: "5.5s",
    parallaxSpeed: -9,
  },
];

const RISING_CAN_POSITIONS = [
  { left: "6%", delay: "0s", rot: "-8deg" },
  { left: "21%", delay: "0.6s", rot: "12deg" },
  { left: "40%", delay: "1.2s", rot: "-5deg" },
  { left: "62%", delay: "0.9s", rot: "18deg" },
  { left: "80%", delay: "1.8s", rot: "-12deg" },
  { left: "93%", delay: "0.4s", rot: "6deg" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const GCX = 150;
const GCY = 148;
const GR = 118;

function toSVGPoint(angleDeg: number, r = GR) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: GCX + r * Math.cos(rad),
    y: GCY - r * Math.sin(rad),
  };
}

function gaugeBgPath(): string {
  const start = toSVGPoint(180);
  const end = toSVGPoint(0);
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${GR} ${GR} 0 0 0 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function gaugeFillPath(energy: number): string {
  if (energy <= 0.5) return "";
  const clampedE = Math.min(99.9, Math.max(0.1, energy));
  const endAngleDeg = 180 - (clampedE / 100) * 180;
  const end = toSVGPoint(endAngleDeg);
  const largeArc = clampedE > 50 ? 1 : 0;
  const start = toSVGPoint(180);
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${GR} ${GR} 0 ${largeArc} 0 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function getEnergyLevel(energy: number) {
  return (
    BOBBY_LEVELS.find((l) => energy >= l.min && energy <= l.max) ||
    BOBBY_LEVELS[3]
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── HIGH NOON CAN COMPONENT ─────────────────────────────────────────────────

interface CanProps {
  size?: number;
  rotation?: number;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function HighNoonCan({
  size = 1,
  rotation = 0,
  glow = false,
  className = "",
  style = {},
}: CanProps) {
  const w = 38 * size;
  const h = 96 * size;
  const fs = h * 0.095;

  return (
    <div
      className={className}
      style={{
        width: w,
        height: h,
        transform: `rotate(${rotation}deg)`,
        position: "relative",
        filter: glow
          ? "drop-shadow(0 0 14px rgba(53,230,213,0.9)) drop-shadow(0 0 28px rgba(53,230,213,0.4))"
          : "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${5 * size}px`,
          overflow: "hidden",
          background:
            "linear-gradient(90deg, #b8b8b8 0%, #e8e8e8 25%, #ffffff 50%, #e0e0e0 75%, #a8a8a8 100%)",
          boxShadow: `inset -${2 * size}px 0 ${5 * size}px rgba(0,0,0,0.25), inset ${2 * size}px 0 ${5 * size}px rgba(255,255,255,0.5)`,
        }}
      >
        {/* Top metallic cap */}
        <div
          style={{
            height: "10%",
            background: "linear-gradient(180deg, #888 0%, #bbb 50%, #999 100%)",
            borderRadius: `${5 * size}px ${5 * size}px 0 0`,
          }}
        />
        {/* Upper white body */}
        <div
          style={{
            height: "20%",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: fs * 0.65,
              fontWeight: 800,
              color: "#222",
              letterSpacing: "0.08em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            HIGH
          </span>
        </div>
        {/* Teal brand band */}
        <div
          style={{
            height: "28%",
            background:
              "linear-gradient(180deg, #2CB7D6 0%, #35E6D5 50%, #1E88C9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: fs,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            NOON
          </span>
        </div>
        {/* Lower body */}
        <div
          style={{
            flex: 1,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: fs * 0.5,
              color: "#555",
              fontWeight: 600,
              letterSpacing: "0.05em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            LIME
          </span>
          <span
            style={{
              fontSize: fs * 0.42,
              color: "#888",
              fontFamily: "Inter, sans-serif",
            }}
          >
            HARD SELTZER
          </span>
        </div>
        {/* Bottom metallic cap */}
        <div
          style={{
            height: "7%",
            background: "linear-gradient(180deg, #bbb 0%, #888 100%)",
          }}
        />
      </div>
    </div>
  );
}

// ─── STARFIELD ────────────────────────────────────────────────────────────────

function StarField({ count = 90 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        cx: ((i * 137.5) % 100).toFixed(2),
        cy: ((i * 97.3) % 100).toFixed(2),
        r: ((i % 3) * 0.5 + 0.4).toFixed(1),
        delay: ((i * 0.37) % 4).toFixed(2),
        dur: (2 + (i % 3)).toFixed(1),
      })),
    [count],
  );

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={`${s.cx}%`}
          cy={`${s.cy}%`}
          r={s.r}
          fill="#EAF0FF"
          style={{
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </svg>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function NavBar({
  onEnergyClick,
  bobbyMode,
}: { onEnergyClick: () => void; bobbyMode: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      data-ocid="nav.panel"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: scrolled ? "rgba(6, 10, 20, 0.92)" : "rgba(6, 10, 20, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(247,200,90,0.25)"
          : "1px solid rgba(247,200,90,0.1)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
            color: "#F7C85A",
            textShadow: "0 0 12px rgba(247,200,90,0.6)",
          }}
        >
          BHNU
        </span>
        <span
          style={{
            fontSize: 12,
            color: "rgba(184,192,217,0.8)",
            fontWeight: 500,
            display: "none",
          }}
          className="sm:block"
        >
          Bobby&apos;s High Noon Universe
        </span>
        {bobbyMode && (
          <span
            style={{
              fontSize: 10,
              background: "linear-gradient(90deg, #F7C85A, #35E6D5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
              letterSpacing: "0.1em",
              animation: "shimmer 2s linear infinite",
            }}
          >
            ✦ BOBBY MODE
          </span>
        )}
      </div>

      {/* Nav links */}
      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
        className="hidden md:flex"
      >
        {[
          { label: "The Orb", id: "the-orb" },
          { label: "The Map", id: "the-map" },
          { label: "The Hall", id: "the-hall" },
          { label: "The Finale", id: "the-finale" },
        ].map((item) => (
          <button
            type="button"
            key={item.id}
            data-ocid={`nav.${item.id}.link`}
            onClick={() => scrollToId(item.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "none",
              background: "transparent",
              color: "rgba(184,192,217,0.85)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.2s, background 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F7C85A";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(247,200,90,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(184,192,217,0.85)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Energy button */}
      <button
        type="button"
        data-ocid="nav.energy.button"
        onClick={onEnergyClick}
        style={{
          padding: "8px 18px",
          borderRadius: 999,
          border: "1.5px solid rgba(247,200,90,0.7)",
          background: "rgba(247,200,90,0.12)",
          color: "#F7C85A",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.02em",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(247,200,90,0.25)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 20px rgba(247,200,90,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(247,200,90,0.12)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        ⚡ Energy!
      </button>
    </nav>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

function HeroSection({
  onEnterBobbyMode,
  bobbyMode,
}: {
  onEnterBobbyMode: () => void;
  bobbyMode: boolean;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  }, []);

  return (
    <section
      data-ocid="hero.section"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #060A14 0%, #0A0F22 20%, #1A0B3A 40%, #2B1040 55%, #5B2B30 70%, #8B4020 82%, #C06018 90%, #E08030 96%, #F7A040 100%)",
      }}
    >
      <StarField count={100} />

      {/* Pool reflection at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(13,90,139,0.6) 40%, rgba(30,136,201,0.8) 100%)",
          borderTop: "1px solid rgba(44,183,214,0.3)",
          pointerEvents: "none",
        }}
      />

      {/* Floating cans */}
      {HERO_CANS.map((can) => (
        <div
          key={`can-${can.top}-${can.left ?? can.right}`}
          style={{
            position: "absolute",
            top: can.top,
            left: can.left,
            right: can.right,
            transform: `translate(${mouse.x * can.parallaxSpeed}px, ${mouse.y * can.parallaxSpeed}px)`,
            transition: "transform 0.15s ease-out",
            willChange: "transform",
            zIndex: 1,
          }}
        >
          <div
            style={{
              animation: `float ${can.animDuration} ${can.animDelay} ease-in-out infinite alternate`,
            }}
          >
            <HighNoonCan
              size={can.size}
              rotation={can.rotation}
              glow={bobbyMode}
            />
          </div>
        </div>
      ))}

      {/* Hero content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 24px",
          maxWidth: 900,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div
            style={{
              fontSize: "clamp(12px, 2vw, 16px)",
              fontWeight: 600,
              letterSpacing: "0.3em",
              color: "rgba(184,192,217,0.8)",
              marginBottom: 16,
              fontFamily: "Inter, sans-serif",
            }}
          >
            WELCOME TO
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 8vw, 96px)",
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              WebkitTextStroke: "2px #F7C85A",
              color: "transparent",
              textShadow:
                "0 0 30px rgba(247,200,90,0.5), 0 0 80px rgba(247,200,90,0.25), 0 0 140px rgba(255,164,58,0.15)",
              marginBottom: 20,
            }}
          >
            BOBBY&apos;S
            <br />
            HIGH NOON
            <br />
            UNIVERSE
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 2.5vw, 20px)",
              color: "#B8C0D9",
              fontWeight: 400,
              marginBottom: 40,
              fontFamily: "Inter, sans-serif",
            }}
          >
            A Once-in-a-Generation Noon Entity Has Arrived
          </p>

          {/* CTA Button */}
          <motion.button
            data-ocid="hero.primary_button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnterBobbyMode}
            style={{
              padding: "16px 40px",
              borderRadius: 999,
              border: "2px solid #F7C85A",
              background: bobbyMode
                ? "linear-gradient(135deg, #F7C85A, #FFA43A)"
                : "rgba(247,200,90,0.15)",
              color: bobbyMode ? "#060A14" : "#F7C85A",
              fontSize: 17,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.05em",
              boxShadow:
                "0 0 30px rgba(247,200,90,0.35), 0 0 60px rgba(247,200,90,0.15)",
              transition: "background 0.3s, color 0.3s",
            }}
          >
            {bobbyMode ? "✦ BOBBY MODE ACTIVE ✦" : "🌅 ENTER BOBBY MODE"}
          </motion.button>
        </motion.div>
      </div>

      {/* Nooners detected badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "32%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          padding: "8px 20px",
          borderRadius: 999,
          background: "rgba(53,230,213,0.12)",
          border: "1px solid rgba(53,230,213,0.5)",
          color: "#35E6D5",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
          animation: "blink 2s ease-in-out infinite",
          whiteSpace: "nowrap",
        }}
      >
        📡 14 NOONERS DETECTED IN YOUR AREA
      </motion.div>
    </section>
  );
}

// ─── ENERGY METER SECTION ────────────────────────────────────────────────────

function EnergyMeterSection({
  energy,
  onBoost,
  bobbyMode,
}: {
  energy: number;
  onBoost: () => void;
  bobbyMode: boolean;
}) {
  const level = getEnergyLevel(energy);
  const needleRotation = -90 + 180 * (energy / 100);
  const fillPath = gaugeFillPath(energy);
  const bgPath = gaugeBgPath();

  return (
    <section
      id="the-orb"
      data-ocid="energy.section"
      style={{
        position: "relative",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #060A14 0%, #0B1430 100%)",
        overflow: "hidden",
        padding: "80px 24px",
      }}
    >
      <StarField count={60} />

      {/* Glow rings behind gauge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(247,200,90,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: bobbyMode
            ? "pulse-glow 1.5s ease-in-out infinite"
            : "pulse-glow 3s ease-in-out infinite",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(184,192,217,0.6)",
              marginBottom: 8,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            LIVE READINGS FROM THE BOBBY DIMENSION
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 5vw, 42px)",
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.01em",
              color: "white",
              textShadow: "0 0 20px rgba(247,200,90,0.3)",
            }}
          >
            BOBBY ENERGY METER
          </h2>
        </div>

        {/* SVG Gauge */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            animation: bobbyMode
              ? "needle-flash 2s ease-in-out infinite"
              : undefined,
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 300 170"
            style={{ width: "100%", overflow: "visible" }}
          >
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF4D7A" />
                <stop offset="33%" stopColor="#FFA43A" />
                <stop offset="66%" stopColor="#F7C85A" />
                <stop offset="100%" stopColor="#35E6D5" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" />
              </filter>
            </defs>

            {/* Background arc */}
            <path
              d={bgPath}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Filled arc */}
            {fillPath && (
              <path
                d={fillPath}
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(247,200,90,0.6))" }}
              />
            )}

            {/* Level boundary ticks */}
            {[24, 49, 74].map((pct) => {
              const angle = 180 - (pct / 100) * 180;
              const outer = toSVGPoint(angle, GR + 10);
              const inner = toSVGPoint(angle, GR - 10);
              return (
                <line
                  key={pct}
                  x1={inner.x.toFixed(1)}
                  y1={inner.y.toFixed(1)}
                  x2={outer.x.toFixed(1)}
                  y2={outer.y.toFixed(1)}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Needle */}
            <g
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transformOrigin: `${GCX}px ${GCY}px`,
                transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <line
                x1={GCX}
                y1={GCY}
                x2={GCX}
                y2={GCY - 100}
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
              />
              <line
                x1={GCX}
                y1={GCY}
                x2={GCX}
                y2={GCY + 14}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* Pivot circle */}
            <circle
              cx={GCX}
              cy={GCY}
              r={9}
              fill="rgba(247,200,90,0.2)"
              stroke="rgba(247,200,90,0.6)"
              strokeWidth="1.5"
            />
            <circle
              cx={GCX}
              cy={GCY}
              r={4}
              fill={level.color}
              style={{ filter: `drop-shadow(0 0 6px ${level.color})` }}
            />

            {/* Center text */}
            <text
              x={GCX}
              y={GCY - 20}
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="800"
              fontFamily="Inter, sans-serif"
            >
              {Math.round(energy)}%
            </text>
            <text
              x={GCX}
              y={GCY - 4}
              textAnchor="middle"
              fill={level.color}
              fontSize="10"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
              letterSpacing="0.05em"
            >
              {level.emoji} {level.label.toUpperCase()}
            </text>

            {/* Arc endpoint labels */}
            <text
              x="24"
              y="164"
              textAnchor="middle"
              fill="rgba(184,192,217,0.5)"
              fontSize="9"
              fontFamily="Inter, sans-serif"
            >
              0%
            </text>
            <text
              x="276"
              y="164"
              textAnchor="middle"
              fill="rgba(184,192,217,0.5)"
              fontSize="9"
              fontFamily="Inter, sans-serif"
            >
              100%
            </text>
          </svg>
        </div>

        {/* Level labels */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {BOBBY_LEVELS.map((lvl) => (
            <div
              key={lvl.label}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                border: `1px solid ${energy >= lvl.min && energy <= lvl.max ? lvl.color : "rgba(255,255,255,0.1)"}`,
                background:
                  energy >= lvl.min && energy <= lvl.max
                    ? `${lvl.color}22`
                    : "transparent",
                color:
                  energy >= lvl.min && energy <= lvl.max
                    ? lvl.color
                    : "rgba(184,192,217,0.4)",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                transition: "all 0.4s ease",
              }}
            >
              {lvl.emoji} {lvl.label}
            </div>
          ))}
        </div>

        {/* Boost button */}
        <motion.button
          data-ocid="energy.primary_button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onBoost}
          style={{
            padding: "14px 36px",
            borderRadius: 999,
            border: "2px solid rgba(53,230,213,0.7)",
            background: "rgba(53,230,213,0.12)",
            color: "#35E6D5",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.05em",
            boxShadow: "0 0 20px rgba(53,230,213,0.2)",
            transition: "box-shadow 0.2s",
          }}
        >
          ⚡ BOOST BOBBY
        </motion.button>

        {/* Status line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(184,192,217,0.6)",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#35E6D5",
              display: "inline-block",
              animation: "pulse-glow 1.5s ease-in-out infinite",
              boxShadow: "0 0 6px #35E6D5",
            }}
          />
          ⚡ Detecting Bobby frequency... readings are off the charts
        </div>
      </motion.div>
    </section>
  );
}

// ─── CONSTELLATION SECTION ───────────────────────────────────────────────────

function ConstellationSection() {
  const [activeLore, setActiveLore] = useState<number | null>(null);

  const handleBgClick = useCallback(() => setActiveLore(null), []);

  return (
    <section
      id="the-map"
      data-ocid="cosmos.section"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #0B1430 0%, #060A14 100%)",
        padding: "80px 24px 100px",
        overflow: "hidden",
      }}
    >
      <StarField count={70} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(53,230,213,0.7)",
              marginBottom: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            INTERACTIVE CONSTELLATION MAP
          </div>
          <h2
            style={{
              fontSize: "clamp(22px, 5vw, 38px)",
              fontWeight: 900,
              color: "white",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}
          >
            HIGH NOON COSMOS
          </h2>
          <p
            style={{
              color: "#B8C0D9",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Click the cans to reveal Bobby Lore
          </p>
        </motion.div>

        {/* Constellation container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          onClick={handleBgClick}
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "52%",
            background: "rgba(6,10,20,0.7)",
            borderRadius: 20,
            border: "1px solid rgba(247,200,90,0.15)",
            overflow: "hidden",
          }}
        >
          {/* SVG lines */}
          <svg
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {CONSTELLATION_LINES.map(([a, b]) => {
              const sa = CAN_STARS[a];
              const sb = CAN_STARS[b];
              const isCross = sa.constellation !== sb.constellation;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={`${sa.x}%`}
                  y1={`${sa.y}%`}
                  x2={`${sb.x}%`}
                  y2={`${sb.y}%`}
                  stroke={
                    isCross ? "rgba(247,200,90,0.15)" : "rgba(247,200,90,0.35)"
                  }
                  strokeWidth={isCross ? "1" : "1.5"}
                  strokeDasharray={isCross ? "4 4" : undefined}
                />
              );
            })}

            {/* Constellation labels */}
            {CONSTELLATION_LABELS.map((lbl) => (
              <text
                key={lbl.name}
                x={`${lbl.x}%`}
                y={`${lbl.y}%`}
                textAnchor="middle"
                fill="rgba(247,200,90,0.45)"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                letterSpacing="0.1em"
              >
                {lbl.name.toUpperCase()}
              </text>
            ))}
          </svg>

          {/* Can stars */}
          {CAN_STARS.map((star) => (
            <button
              type="button"
              key={star.id}
              data-ocid={`cosmos.item.${star.id + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveLore(activeLore === star.id ? null : star.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setActiveLore(activeLore === star.id ? null : star.id);
                }
              }}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: activeLore === star.id ? 10 : 2,
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              {/* Glow dot */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    activeLore === star.id ? "#F7C85A" : "rgba(247,200,90,0.7)",
                  boxShadow:
                    activeLore === star.id
                      ? "0 0 16px #F7C85A, 0 0 32px rgba(247,200,90,0.5)"
                      : "0 0 8px rgba(247,200,90,0.5)",
                  animation: "twinkle 2s ease-in-out infinite alternate",
                  transition: "all 0.2s",
                }}
              />
              {/* Tiny can icon */}
              <div
                style={{
                  position: "absolute",
                  bottom: "130%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 14,
                  pointerEvents: "none",
                  animation: "float-slow 3s ease-in-out infinite alternate",
                }}
              >
                🥫
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {activeLore === star.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    data-ocid={`cosmos.item.${star.id + 1}.panel`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      bottom: "160%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 220,
                      background: "rgba(6,10,20,0.97)",
                      border: "1px solid rgba(247,200,90,0.5)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      zIndex: 20,
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#F7C85A",
                        fontWeight: 800,
                        marginBottom: 6,
                        letterSpacing: "0.08em",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {star.constellation.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#EAF0FF",
                        lineHeight: 1.5,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {star.lore}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── HALL OF GREATNESS ───────────────────────────────────────────────────────

function HallSection() {
  return (
    <section
      id="the-hall"
      data-ocid="hall.section"
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, #060A14 0%, #0B1430 50%, #060A14 100%)",
        padding: "80px 24px 100px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(247,200,90,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(247,200,90,0.7)",
              marginBottom: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            CERTIFIED BY THE INTERNATIONAL COUNCIL OF NOON
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 5vw, 42px)",
              fontWeight: 900,
              color: "white",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            THE BOBBY HALL OF GREATNESS
          </h2>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {AWARDS.map((award, i) => (
            <motion.div
              key={award.title}
              data-ocid={`hall.item.${i + 1}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              whileHover={{
                y: -8,
                boxShadow:
                  "0 0 30px rgba(247,200,90,0.35), 0 16px 40px rgba(0,0,0,0.5)",
              }}
              style={{
                position: "relative",
                background: "rgba(10,18,40,0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(247,200,90,0.25)",
                borderRadius: 16,
                padding: "28px 24px 32px",
                cursor: "default",
                transition: "border-color 0.3s",
                overflow: "hidden",
              }}
            >
              {/* Subtle top glow line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(247,200,90,0.6), transparent)",
                }}
              />

              <div style={{ fontSize: 44, marginBottom: 14 }}>
                {award.emoji}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "0.04em",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {award.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(184,192,217,0.6)",
                  marginBottom: 6,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Awarded: Summer Eternal
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#B8C0D9",
                  lineHeight: 1.5,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {award.desc}
              </div>

              {/* CERTIFIED stamp */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  padding: "3px 8px",
                  border: "1.5px solid rgba(53,230,213,0.55)",
                  borderRadius: 4,
                  color: "rgba(53,230,213,0.7)",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  transform: "rotate(-8deg)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                CERTIFIED
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMPLIMENT GENERATOR ────────────────────────────────────────────────────

function ComplimentSection() {
  const [complimentIdx, setComplimentIdx] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  const generateCompliment = useCallback(() => {
    let newIdx: number;
    do {
      newIdx = Math.floor(Math.random() * COMPLIMENTS.length);
    } while (newIdx === complimentIdx);
    setComplimentIdx(newIdx);
    setKey((k) => k + 1);
  }, [complimentIdx]);

  const compliment = complimentIdx !== null ? COMPLIMENTS[complimentIdx] : null;

  // Highlight "Bobby" in the compliment
  function highlightBobby(text: string) {
    const parts = text.split(/(Bobby)/g);
    return parts.map((part, i) =>
      part === "Bobby" ? (
        <span
          key={`${part.length > 0 ? part.slice(0, 8) : "empty"}-${String(i)}`}
          style={{
            color: "#35E6D5",
            textShadow: "0 0 10px rgba(53,230,213,0.5)",
            fontWeight: 800,
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  return (
    <section
      data-ocid="compliment.section"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #0B1430 0%, #060A14 100%)",
        padding: "80px 24px 100px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(53,230,213,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(53,230,213,0.7)",
              marginBottom: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            POWERED BY THE BOBBY SINGULARITY
          </div>
          <h2
            style={{
              fontSize: "clamp(22px, 5vw, 38px)",
              fontWeight: 900,
              color: "white",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            BOBBY COMPLIMENT GENERATOR™
          </h2>
        </div>

        <motion.button
          data-ocid="compliment.primary_button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={generateCompliment}
          style={{
            padding: "16px 44px",
            borderRadius: 999,
            border: "2px solid #F7C85A",
            background:
              "linear-gradient(135deg, rgba(247,200,90,0.2), rgba(255,164,58,0.1))",
            color: "#F7C85A",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.05em",
            boxShadow:
              "0 0 24px rgba(247,200,90,0.3), 0 0 48px rgba(247,200,90,0.1)",
          }}
        >
          ✨ GENERATE COMPLIMENT
        </motion.button>

        {/* Compliment display */}
        <div
          style={{
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <AnimatePresence mode="wait">
            {compliment && (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                data-ocid="compliment.panel"
                style={{
                  background: "rgba(10,18,40,0.7)",
                  border: "1px solid rgba(247,200,90,0.3)",
                  borderRadius: 16,
                  padding: "28px 32px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(15px, 2.5vw, 20px)",
                    color: "#EAF0FF",
                    lineHeight: 1.6,
                    fontFamily: "Inter, sans-serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  &ldquo;{highlightBobby(compliment)}&rdquo;
                </p>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 11,
                    color: "rgba(184,192,217,0.5)",
                    letterSpacing: "0.1em",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  — CERTIFIED BOBBY FACT #{(complimentIdx ?? 0) + 1}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!compliment && (
          <p
            style={{
              color: "rgba(184,192,217,0.4)",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              fontStyle: "italic",
            }}
          >
            Press the button. Bobby deserves to hear this.
          </p>
        )}
      </motion.div>
    </section>
  );
}

// ─── FINALE SECTION ───────────────────────────────────────────────────────────

function FinaleSection({ onHonorAgain }: { onHonorAgain: () => void }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${((i * 1.73) % 100).toFixed(1)}%`,
        delay: `${((i * 0.087) % 5).toFixed(2)}s`,
        duration: `${(3 + ((i * 0.15) % 4)).toFixed(1)}s`,
        color: [
          "#F7C85A",
          "#35E6D5",
          "#FF6B4A",
          "#FFFFFF",
          "#FF4D7A",
          "#FFA43A",
        ][i % 6],
        size: 4 + (i % 9),
        isCircle: i % 3 === 0,
      })),
    [],
  );

  return (
    <section
      id="the-finale"
      data-ocid="finale.section"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #060A14 0%, #0A0F22 30%, #0F1525 100%)",
        padding: "80px 24px",
      }}
    >
      <StarField count={80} />

      {/* Pulsing rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: ring * 300,
            height: ring * 300,
            borderRadius: "50%",
            border: `1px solid rgba(247,200,90,${0.15 / ring})`,
            transform: "translate(-50%, -50%)",
            animation: `ring-pulse 3s ${ring * 0.8}s ease-out infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={`confetti-${c.id}`}
          style={{
            position: "absolute",
            top: 0,
            left: c.left,
            width: c.size,
            height: c.isCircle ? c.size : c.size * 2.5,
            borderRadius: c.isCircle ? "50%" : 2,
            background: c.color,
            animation: `confetti-fall ${c.duration} ${c.delay} linear infinite`,
            pointerEvents: "none",
            opacity: 0.85,
          }}
        />
      ))}

      {/* Rising cans */}
      {RISING_CAN_POSITIONS.map((pos) => (
        <div
          key={`rise-${pos.left}`}
          style={
            {
              position: "absolute",
              bottom: -20,
              left: pos.left,
              animation: `rise 6s ${pos.delay} ease-in infinite`,
              "--rise-rot": pos.rot,
              zIndex: 1,
            } as React.CSSProperties
          }
        >
          <HighNoonCan size={0.9} rotation={0} glow />
        </div>
      ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.4em",
            color: "rgba(184,192,217,0.6)",
            marginBottom: 16,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
          }}
        >
          ✦ CERTIFIED FINALE ✦
        </div>

        <h2
          style={{
            fontSize: "clamp(40px, 10vw, 100px)",
            fontWeight: 900,
            fontFamily: "Inter, sans-serif",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              display: "block",
              WebkitTextStroke: "2px #F7C85A",
              color: "transparent",
              textShadow:
                "0 0 40px rgba(247,200,90,0.6), 0 0 80px rgba(247,200,90,0.3)",
            }}
          >
            BOBBY:
          </span>
          <span
            style={{
              display: "block",
              color: "white",
              fontSize: "0.55em",
              fontWeight: 800,
            }}
          >
            A ONCE-IN-A-GENERATION
          </span>
          <span
            style={{
              display: "block",
              background: "linear-gradient(135deg, #35E6D5, #2FD3FF, #35E6D5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              fontSize: "0.7em",
            }}
          >
            NOON ENTITY
          </span>
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#B8C0D9",
            marginBottom: 44,
            fontFamily: "Inter, sans-serif",
          }}
        >
          The universe has been forever altered by his presence.
        </p>

        <motion.button
          data-ocid="finale.primary_button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onHonorAgain}
          style={{
            padding: "18px 48px",
            borderRadius: 999,
            border: "2px solid #F7C85A",
            background:
              "linear-gradient(135deg, rgba(247,200,90,0.25), rgba(255,164,58,0.15))",
            color: "#F7C85A",
            fontSize: 18,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.04em",
            boxShadow:
              "0 0 40px rgba(247,200,90,0.4), 0 0 80px rgba(247,200,90,0.2)",
          }}
        >
          🎊 HONOR BOBBY AGAIN
        </motion.button>

        <div
          style={{
            marginTop: 28,
            fontSize: 11,
            color: "rgba(184,192,217,0.35)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          This tribute was approved by the International Bobby Council • Est.
          Summer Eternal
        </div>

        {/* Certified Bobby Moment badge */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: "inline-block",
            marginTop: 32,
            padding: "10px 28px",
            border: "2px solid rgba(247,200,90,0.6)",
            borderRadius: 999,
            background: "rgba(247,200,90,0.08)",
            color: "#F7C85A",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.15em",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 0 20px rgba(247,200,90,0.2)",
          }}
        >
          ✦ CERTIFIED BOBBY MOMENT ✦
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function AppFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      style={{
        background: "rgba(4, 7, 14, 0.98)",
        borderTop: "1px solid rgba(247,200,90,0.12)",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "rgba(184,192,217,0.45)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        © Summer Eternal • BHNU • Stay Weird, Stay Nooned
      </div>

      <div
        style={{
          fontSize: 11,
          color: "rgba(247,200,90,0.5)",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.1em",
          animation: "bounce-y 2s ease-in-out infinite",
        }}
      >
        SCROLL FOR STOKE ↓
      </div>

      <div
        style={{
          fontSize: 11,
          color: "rgba(184,192,217,0.45)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Built with 100% Bobby Energy •{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(247,200,90,0.6)", textDecoration: "none" }}
        >
          caffeine.ai
        </a>{" "}
        &copy; {year}
      </div>
    </footer>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [bobbyMode, setBobbyMode] = useState(false);
  const [energy, setEnergy] = useState(45);

  // Gentle energy oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => {
        const delta = (Math.random() - 0.5) * 5;
        return Math.max(5, Math.min(95, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEnterBobbyMode = useCallback(() => {
    setBobbyMode(true);
    setEnergy(82);
    toast.success("🌅 BOBBY MODE ACTIVATED", {
      description: "The universe has been notified. Vibes at maximum.",
      duration: 4000,
    });
  }, []);

  const handleBoost = useCallback(() => {
    setEnergy((prev) => {
      const boost = 10 + Math.floor(Math.random() * 8);
      const next = Math.min(100, prev + boost);
      if (next >= 75 && prev < 75) {
        toast.success("⚡ ASTRAL NOON BOBBY UNLOCKED", {
          description: "Maximum Bobby detected. Universe recalibrating.",
        });
      }
      return next;
    });
  }, []);

  const handleHonorAgain = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEnergyNav = useCallback(() => {
    scrollToId("the-orb");
  }, []);

  return (
    <div className={bobbyMode ? "bobby-mode-active" : ""}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(6,10,20,0.95)",
            border: "1px solid rgba(247,200,90,0.5)",
            color: "#EAF0FF",
            fontFamily: "Inter, sans-serif",
            backdropFilter: "blur(12px)",
          },
        }}
      />

      {/* Bobby Mode overlay */}
      <AnimatePresence>
        {bobbyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 5,
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(247,200,90,0.07) 0%, transparent 65%)",
              animation: "pulse-glow 4s ease-in-out infinite",
            }}
          />
        )}
      </AnimatePresence>

      <NavBar onEnergyClick={handleEnergyNav} bobbyMode={bobbyMode} />

      <main>
        <HeroSection
          onEnterBobbyMode={handleEnterBobbyMode}
          bobbyMode={bobbyMode}
        />
        <EnergyMeterSection
          energy={energy}
          onBoost={handleBoost}
          bobbyMode={bobbyMode}
        />
        <ConstellationSection />
        <HallSection />
        <ComplimentSection />
        <FinaleSection onHonorAgain={handleHonorAgain} />
      </main>

      <AppFooter />
    </div>
  );
}
