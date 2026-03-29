import { useCallback, useEffect, useRef, useState } from "react";

const FLAVORS = [
  { emoji: "🍋", label: "Lemon", color: "#F5E642", pts: 1 },
  { emoji: "🍑", label: "Peach", color: "#F4A261", pts: 2 },
  { emoji: "🍓", label: "Strawberry", color: "#E63946", pts: 3 },
  { emoji: "💀", label: "Bad Vibe", color: "#9B1B30", pts: -1 },
];

const HS_KEY = "noon-drop-high";

interface Can {
  id: number;
  x: number;
  y: number;
  vy: number;
  flavorIdx: number;
  radius: number;
}

interface GameState {
  cans: Can[];
  paddleX: number;
  score: number;
  lives: number;
  running: boolean;
  over: boolean;
  flash: number;
  nextId: number;
  speed: number;
  spawnTimer: number;
  levelTimer: number;
}

export default function CanCatcher({ bobbyMode }: { bobbyMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>({
    cans: [],
    paddleX: 300,
    score: 0,
    lives: 3,
    running: false,
    over: false,
    flash: 0,
    nextId: 0,
    speed: 1,
    spawnTimer: 0,
    levelTimer: 0,
  });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [uiState, setUiState] = useState({
    running: false,
    over: false,
    score: 0,
  });
  const [highScore, setHighScore] = useState(() =>
    Number.parseInt(localStorage.getItem(HS_KEY) || "0", 10),
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const { w, h } = { w: canvas.width, h: canvas.height };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#060A14";
    ctx.fillRect(0, 0, w, h);

    if (s.flash > 0) {
      ctx.fillStyle = `rgba(220,0,0,${s.flash * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc((i * 137.5) % w, (i * 93.7) % (h * 0.8), 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const can of s.cans) {
      const f = FLAVORS[can.flavorIdx];
      ctx.beginPath();
      ctx.arc(can.x, can.y, can.radius, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillText(f.emoji, can.x, can.y);
    }

    const pw = Math.min(120, w * 0.22);
    const ph = 18;
    const py = h - 50;
    const px = s.paddleX - pw / 2;
    ctx.beginPath();
    const r = ph / 2;
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
    ctx.lineTo(px + r, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
    ctx.lineTo(px, py + r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.closePath();
    const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, "#F7C85A");
    g.addColorStop(1, "#E8A500");
    ctx.fillStyle = g;
    ctx.fill();
    if (bobbyMode) {
      ctx.shadowColor = "#F7C85A";
      ctx.shadowBlur = 16;
    }
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillText("🫙", s.paddleX, py + ph / 2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(234,240,255,0.9)";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Score: ${s.score}`, 16, 14);
    ctx.textAlign = "center";
    ctx.fillText(`Best: ${highScore}`, w / 2, 14);
    ctx.textAlign = "right";
    const livesStr = Array.from({ length: s.lives }, () => "🌅").join(" ");
    ctx.fillText(livesStr, w - 12, 14);
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = "rgba(53,230,213,0.7)";
    ctx.textAlign = "left";
    ctx.fillText(`Speed x${s.speed.toFixed(1)}`, 16, 34);
    ctx.textBaseline = "alphabetic";
  }, [highScore, bobbyMode]);

  const spawnCan = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    const w = canvas.width;
    const flavorIdx = Math.random() < 0.15 ? 3 : Math.floor(Math.random() * 3);
    const radius = 22;
    s.cans.push({
      id: s.nextId++,
      x: radius + Math.random() * (w - radius * 2),
      y: -radius,
      vy: (1.8 + Math.random() * 1.2) * s.speed,
      flavorIdx,
      radius,
    });
  }, []);

  const loop = useCallback(
    (ts: number) => {
      const dt = Math.min((ts - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = ts;
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !s.running) return;
      const h = canvas.height;
      const pw = Math.min(120, canvas.width * 0.22);

      s.flash = Math.max(0, s.flash - 0.05 * dt);
      s.spawnTimer += dt;
      s.levelTimer += dt;

      const spawnInterval = Math.max(28, 60 - s.speed * 8);
      if (s.spawnTimer >= spawnInterval) {
        s.spawnTimer = 0;
        spawnCan();
        if (Math.random() < 0.3 * s.speed) spawnCan();
      }

      if (s.levelTimer >= 600) {
        s.levelTimer = 0;
        s.speed = Math.min(3.5, s.speed + 0.3);
      }

      const py = h - 50;
      const toRemove: number[] = [];
      for (const can of s.cans) {
        can.y += can.vy * dt;
        if (
          can.y + can.radius >= py &&
          can.y - can.radius <= py + 18 &&
          can.x >= s.paddleX - pw / 2 - can.radius &&
          can.x <= s.paddleX + pw / 2 + can.radius
        ) {
          toRemove.push(can.id);
          const f = FLAVORS[can.flavorIdx];
          if (f.pts < 0) {
            s.lives = Math.max(0, s.lives - 1);
            s.flash = 1;
            if (s.lives === 0) {
              s.running = false;
              s.over = true;
              const hs = Math.max(highScore, s.score);
              localStorage.setItem(HS_KEY, String(hs));
              setHighScore(hs);
              setUiState({ running: false, over: true, score: s.score });
            }
          } else {
            s.score += f.pts;
          }
        } else if (can.y - can.radius > h) {
          toRemove.push(can.id);
        }
      }
      s.cans = s.cans.filter((c) => !toRemove.includes(c.id));

      draw();
      rafRef.current = requestAnimationFrame(loop);
    },
    [spawnCan, draw, highScore],
  );

  const startGame = useCallback(() => {
    stateRef.current = {
      cans: [],
      paddleX: (canvasRef.current?.width ?? 600) / 2,
      score: 0,
      lives: 3,
      running: true,
      over: false,
      flash: 0,
      nextId: 0,
      speed: 1,
      spawnTimer: 0,
      levelTimer: 0,
    };
    lastTimeRef.current = performance.now();
    setUiState({ running: true, over: false, score: 0 });
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.paddleX = e.clientX - rect.left;
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      stateRef.current.paddleX = e.touches[0].clientX - rect.left;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });
    ro.observe(container);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "none",
        }}
      />
      {!uiState.running && !uiState.over && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48 }}>🌅</div>
            <h2 style={titleStyle}>NOON DROP</h2>
            <p style={descStyle}>
              Catch the cans, dodge the bad vibes.
              <br />
              Move your mouse to steer Bobby&apos;s paddle.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
                margin: "8px 0",
              }}
            >
              {FLAVORS.map((f) => (
                <span
                  key={f.label}
                  style={{ fontSize: 13, color: "#EAF0FF", opacity: 0.8 }}
                >
                  {f.emoji} {f.label} {f.pts > 0 ? `+${f.pts}` : "💀 -1 life"}
                </span>
              ))}
            </div>
            <button
              data-ocid="cancatcher.primary_button"
              type="button"
              style={btnStyle}
              onClick={startGame}
            >
              START CATCHING
            </button>
          </div>
        </div>
      )}
      {uiState.over && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48 }}>🌅</div>
            <h2 style={titleStyle}>NOON OVER</h2>
            <p
              style={{
                ...descStyle,
                fontSize: 24,
                fontWeight: 800,
                color: "#F7C85A",
              }}
            >
              {uiState.score} pts
            </p>
            {uiState.score >= highScore && uiState.score > 0 && (
              <p style={{ color: "#35E6D5", fontWeight: 700, fontSize: 14 }}>
                🏆 NEW HIGH SCORE!
              </p>
            )}
            <p style={{ color: "rgba(234,240,255,0.6)", fontSize: 13 }}>
              Best: {highScore} pts
            </p>
            <button
              data-ocid="cancatcher.primary_button"
              type="button"
              style={btnStyle}
              onClick={startGame}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(6,10,20,0.85)",
  backdropFilter: "blur(6px)",
};

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
