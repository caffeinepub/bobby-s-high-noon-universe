import { useCallback, useEffect, useRef, useState } from "react";

const HS_KEY = "noon-frenzy-high";
const GAME_DURATION = 30;

const FLAVORS = [
  { emoji: "🍋", label: "Lemon", pts: 1, chance: 0.5 },
  { emoji: "🍑", label: "Peach", pts: 2, chance: 0.35 },
  { emoji: "🍓", label: "Strawberry", pts: 3, chance: 0.15 },
];

const COMBO_TEXTS = [
  "NOON ENERGY RISING",
  "BOBBY APPROVED",
  "ASTRAL VIBES DETECTED",
];

const TIERS = [
  { min: 0, label: "Mildly Bobby", color: "#B8C0D9" },
  { min: 20, label: "Golden Hour Bobby", color: "#F7C85A" },
  { min: 45, label: "ASTRAL NOON BOBBY", color: "#35E6D5" },
];

const HOLE_IDS = ["h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"];

interface ActiveCan {
  hole: number;
  flavorIdx: number;
  id: number;
  timerId: ReturnType<typeof setTimeout>;
}

interface BurstAnim {
  id: number;
  text: string;
  x: number;
  y: number;
}

type Phase = "idle" | "playing" | "over";

export default function NoonFrenzy({ bobbyMode }: { bobbyMode: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    Number.parseInt(localStorage.getItem(HS_KEY) || "0", 10),
  );
  const [activeCans, setActiveCans] = useState<ActiveCan[]>([]);
  const [bursts, setBursts] = useState<BurstAnim[]>([]);
  const [combo, setCombo] = useState(0);
  const [comboText, setComboText] = useState("");
  const [whoosh, setWhoosh] = useState<number[]>([]);

  const phaseRef = useRef<Phase>("idle");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const nextIdRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef(0);

  phaseRef.current = phase;
  scoreRef.current = score;
  comboRef.current = combo;

  const stopAll = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setActiveCans((prev) => {
      for (const c of prev) clearTimeout(c.timerId);
      return [];
    });
  }, []);

  const spawnCan = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const r = Math.random();
    let flavorIdx = 0;
    let acc = 0;
    for (let i = 0; i < FLAVORS.length; i++) {
      acc += FLAVORS[i].chance;
      if (r < acc) {
        flavorIdx = i;
        break;
      }
    }
    setActiveCans((prev) => {
      const occupied = new Set(prev.map((c) => c.hole));
      const free = Array.from({ length: 9 }, (_, i) => i).filter(
        (i) => !occupied.has(i),
      );
      if (free.length === 0) return prev;
      const hole = free[Math.floor(Math.random() * free.length)];
      const canId = nextIdRef.current++;
      const visibleMs = Math.max(400, 800 - waveRef.current * 40);
      const timerId = setTimeout(() => {
        setActiveCans((p) => {
          const found = p.find((c) => c.id === canId);
          if (found) setWhoosh((w) => [...w, hole]);
          return p.filter((c) => c.id !== canId);
        });
        setTimeout(() => setWhoosh((w) => w.filter((h) => h !== hole)), 400);
      }, visibleMs);
      return [...prev, { hole, flavorIdx, id: canId, timerId }];
    });
    const nextDelay = Math.max(300, 900 - waveRef.current * 30);
    spawnTimerRef.current = setTimeout(spawnCan, nextDelay);
  }, []);

  const startGame = useCallback(() => {
    stopAll();
    setPhase("playing");
    phaseRef.current = "playing";
    setTimeLeft(GAME_DURATION);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setComboText("");
    setActiveCans([]);
    setBursts([]);
    setWhoosh([]);
    waveRef.current = 0;

    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        waveRef.current = GAME_DURATION - next;
        if (next <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
          phaseRef.current = "over";
          setPhase("over");
          setActiveCans((prev) => {
            for (const c of prev) clearTimeout(c.timerId);
            return [];
          });
          const hs = Math.max(highScore, scoreRef.current);
          localStorage.setItem(HS_KEY, String(hs));
          setHighScore(hs);
        }
        return next;
      });
    }, 1000);

    spawnTimerRef.current = setTimeout(spawnCan, 600);
  }, [stopAll, spawnCan, highScore]);

  const hitCan = useCallback(
    (canId: number, flavorIdx: number, e: React.MouseEvent) => {
      setActiveCans((prev) => {
        const found = prev.find((c) => c.id === canId);
        if (!found) return prev;
        clearTimeout(found.timerId);
        return prev.filter((c) => c.id !== canId);
      });
      const pts = FLAVORS[flavorIdx].pts;
      const newCombo = comboRef.current + 1;
      setCombo(newCombo);
      comboRef.current = newCombo;
      let bonus = 0;
      if (newCombo > 0 && newCombo % 3 === 0) {
        bonus = 10;
        setComboText(
          COMBO_TEXTS[Math.floor(Math.random() * COMBO_TEXTS.length)],
        );
        setTimeout(() => setComboText(""), 1500);
      }
      const total = pts + bonus;
      setScore((s) => s + total);
      scoreRef.current += total;
      const burstId = nextIdRef.current++;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setBursts((b) => [
        ...b,
        {
          id: burstId,
          text: `+${total}${bonus ? " COMBO!" : ""}`,
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      ]);
      setTimeout(
        () => setBursts((b) => b.filter((bt) => bt.id !== burstId)),
        700,
      );
    },
    [],
  );

  useEffect(() => () => stopAll(), [stopAll]);

  const getTier = (s: number) => {
    let tier = TIERS[0];
    for (const t of TIERS) {
      if (s >= t.min) tier = t;
    }
    return tier;
  };
  const tier = getTier(score);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        position: "relative",
        background: "#060A14",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {bursts.map((b) => (
        <div
          key={b.id}
          style={{
            position: "fixed",
            left: b.x,
            top: b.y,
            transform: "translate(-50%, -100%)",
            color: "#35E6D5",
            fontWeight: 900,
            fontSize: 18,
            fontFamily: "Inter, sans-serif",
            pointerEvents: "none",
            animation: "frenzy-burst 0.7s forwards",
            zIndex: 9999,
            textShadow: "0 0 8px rgba(53,230,213,0.8)",
          }}
        >
          {b.text}
        </div>
      ))}

      {comboText && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#F7C85A",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.08em",
            textShadow: "0 0 20px rgba(247,200,90,0.9)",
            animation: "frenzy-burst 1.5s forwards",
            pointerEvents: "none",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}
        >
          {comboText}
        </div>
      )}

      {phase === "idle" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 48 }}>🎯</div>
          <h2 style={titleStyle}>NOON FRENZY</h2>
          <p style={descStyle}>
            Whack the cans before they disappear!
            <br />
            30 seconds. Maximum chaos. Pure Bobby energy.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {FLAVORS.map((f) => (
              <span
                key={f.label}
                style={{ fontSize: 13, color: "#EAF0FF", opacity: 0.8 }}
              >
                {f.emoji} +{f.pts}pt{f.pts > 1 ? "s" : ""}
              </span>
            ))}
          </div>
          <p style={{ color: "rgba(53,230,213,0.8)", fontSize: 12 }}>
            3 hits in a row = Bobby Combo! +10 bonus
          </p>
          <button
            data-ocid="noonfrenzy.primary_button"
            type="button"
            style={btnStyle}
            onClick={startGame}
          >
            START FRENZY
          </button>
        </div>
      )}

      {phase === "over" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 48 }}>🌅</div>
          <h2 style={titleStyle}>TIME&apos;S UP!</h2>
          <p
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: tier.color,
              margin: 0,
            }}
          >
            {score} pts
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: tier.color,
              letterSpacing: "0.06em",
            }}
          >
            {tier.label}
          </p>
          {score >= highScore && score > 0 && (
            <p style={{ color: "#35E6D5", fontWeight: 700, fontSize: 14 }}>
              🏆 NEW HIGH SCORE!
            </p>
          )}
          <p style={{ color: "rgba(234,240,255,0.55)", fontSize: 13 }}>
            Best: {highScore} pts
          </p>
          <button
            data-ocid="noonfrenzy.primary_button"
            type="button"
            style={btnStyle}
            onClick={startGame}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div
            style={{
              display: "flex",
              gap: 24,
              marginBottom: 16,
              alignItems: "center",
              width: "100%",
              maxWidth: 500,
              justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(234,240,255,0.5)",
                  letterSpacing: "0.08em",
                }}
              >
                SCORE
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#F7C85A" }}>
                {score}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: timeLeft <= 10 ? "#E63946" : "#35E6D5",
                  fontVariantNumeric: "tabular-nums",
                  textShadow:
                    timeLeft <= 10
                      ? "0 0 20px rgba(230,57,70,0.8)"
                      : "0 0 12px rgba(53,230,213,0.6)",
                }}
              >
                {timeLeft}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(234,240,255,0.5)",
                  letterSpacing: "0.08em",
                }}
              >
                COMBO
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: combo >= 3 ? "#F7C85A" : "rgba(234,240,255,0.7)",
                }}
              >
                {combo >= 3 ? `x${combo} 🔥` : combo > 0 ? `x${combo}` : "–"}
              </div>
            </div>
          </div>

          <div
            data-ocid="noonfrenzy.canvas_target"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              width: "100%",
              maxWidth: 500,
            }}
          >
            {HOLE_IDS.map((hid, i) => {
              const can = activeCans.find((c) => c.hole === i);
              const isWhoosh = whoosh.includes(i);
              return (
                <button
                  key={hid}
                  type="button"
                  data-ocid={`noonfrenzy.item.${i + 1}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${can ? "rgba(247,200,90,0.6)" : isWhoosh ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: can ? "pointer" : "default",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                    boxShadow:
                      bobbyMode && can
                        ? "0 0 20px rgba(247,200,90,0.3)"
                        : "none",
                    padding: 0,
                  }}
                  onClick={
                    can ? (e) => hitCan(can.id, can.flavorIdx, e) : undefined
                  }
                >
                  {can && (
                    <div
                      style={{
                        fontSize: 40,
                        animation: "frenzy-pop 0.15s ease-out",
                        userSelect: "none",
                        filter: bobbyMode
                          ? "drop-shadow(0 0 8px rgba(247,200,90,0.8))"
                          : "none",
                      }}
                    >
                      {FLAVORS[can.flavorIdx].emoji}
                    </div>
                  )}
                  {isWhoosh && !can && (
                    <div
                      style={{
                        fontSize: 24,
                        opacity: 0.5,
                        animation: "frenzy-whoosh 0.4s forwards",
                      }}
                    >
                      💨
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes frenzy-burst {
          0% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -200%) scale(1.4); }
        }
        @keyframes frenzy-pop {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes frenzy-whoosh {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1.5px solid rgba(247,200,90,0.35)",
  borderRadius: 20,
  padding: "36px 40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  maxWidth: 400,
  textAlign: "center",
};
const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 900,
  color: "#F7C85A",
  fontFamily: "Inter, sans-serif",
  letterSpacing: "0.04em",
  margin: 0,
};
const descStyle: React.CSSProperties = {
  fontSize: 14,
  color: "rgba(234,240,255,0.75)",
  fontFamily: "Inter, sans-serif",
  margin: 0,
  lineHeight: 1.6,
};
const btnStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "12px 32px",
  borderRadius: 999,
  border: "1.5px solid #F7C85A",
  background: "rgba(247,200,90,0.15)",
  color: "#F7C85A",
  fontFamily: "Inter, sans-serif",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "0.06em",
};
