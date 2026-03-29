import { useCallback, useEffect, useRef, useState } from "react";

const HS_KEY = "noon-stack-high";
const CAN_COLORS = ["#F7C85A", "#F4A261", "#35E6D5", "#E63946", "#B388FF"];
const BLOCK_H = 32;
const BASE_Y_OFFSET = 60;

function getBlockY(level: number, cameraY: number, canvasH: number) {
  return canvasH - BASE_Y_OFFSET - (level + 1) * BLOCK_H - cameraY;
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  glow: boolean,
) {
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = "16px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(6,10,20,0.8)";
  if (width > 30) {
    ctx.fillText("🫙", x + width / 2, y + height / 2);
  }
  ctx.textBaseline = "alphabetic";
}

interface Block {
  x: number;
  width: number;
  color: string;
  level: number;
}

interface Slider {
  x: number;
  dir: number;
  speed: number;
  width: number;
  color: string;
}

interface FallChunk {
  x: number;
  y: number;
  width: number;
  vy: number;
  color: string;
}

interface FloatingText {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

interface GameState {
  blocks: Block[];
  slider: Slider;
  fallChunks: FallChunk[];
  floatingTexts: FloatingText[];
  score: number;
  running: boolean;
  over: boolean;
  cameraY: number;
}

export default function CanStack({ bobbyMode }: { bobbyMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState | null>(null);
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

  const buildInitialState = useCallback((): GameState => {
    const canvas = canvasRef.current;
    const w = canvas?.width ?? 400;
    const h = canvas?.height ?? 500;
    const initWidth = Math.min(w * 0.55, 200);
    return {
      blocks: [
        {
          x: (w - initWidth) / 2,
          width: initWidth,
          color: CAN_COLORS[0],
          level: 0,
        },
      ],
      slider: {
        x: 0,
        dir: 1,
        speed: 2.5,
        width: initWidth,
        color: CAN_COLORS[1],
      },
      fallChunks: [],
      floatingTexts: [],
      score: 0,
      running: true,
      over: false,
      cameraY: h - BASE_Y_OFFSET - BLOCK_H * 2,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#060A14";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        (i * 137.5) % w,
        (i * 93.7 + s.cameraY * 0.1) % h,
        1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    const groundY = h - BASE_Y_OFFSET + BLOCK_H - s.cameraY;
    ctx.strokeStyle = "rgba(247,200,90,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    for (const block of s.blocks) {
      const by = getBlockY(block.level, s.cameraY, h);
      drawBlock(ctx, block.x, by, block.width, BLOCK_H, block.color, bobbyMode);
    }

    const nextLevel = s.blocks.length;
    const sy = getBlockY(nextLevel, s.cameraY, h) - 4;
    drawBlock(
      ctx,
      s.slider.x,
      sy,
      s.slider.width,
      BLOCK_H,
      s.slider.color,
      bobbyMode,
    );

    for (const fc of s.fallChunks) {
      ctx.fillStyle = fc.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(fc.x, fc.y, fc.width, BLOCK_H);
      ctx.globalAlpha = 1;
    }

    ctx.font = "bold 18px Inter, sans-serif";
    ctx.textAlign = "center";
    for (const ft of s.floatingTexts) {
      ctx.globalAlpha = Math.min(1, ft.life / 0.4);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(234,240,255,0.9)";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Level: ${s.blocks.length}`, 16, 14);
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${s.score}`, w / 2, 14);
    ctx.textAlign = "right";
    ctx.fillText(`Best: ${highScore}`, w - 12, 14);
    ctx.textAlign = "center";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "rgba(53,230,213,0.7)";
    ctx.fillText("CLICK or SPACE to drop", w / 2, h - 20);
    ctx.textBaseline = "alphabetic";
  }, [highScore, bobbyMode]);

  const dropBlock = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running || s.over) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const topBlock = s.blocks[s.blocks.length - 1];
    const sliderL = s.slider.x;
    const sliderR = s.slider.x + s.slider.width;
    const blockL = topBlock.x;
    const blockR = topBlock.x + topBlock.width;
    const overlapL = Math.max(sliderL, blockL);
    const overlapR = Math.min(sliderR, blockR);
    const overlapW = overlapR - overlapL;

    if (overlapW <= 0) {
      s.running = false;
      s.over = true;
      const hs = Math.max(highScore, s.score);
      localStorage.setItem(HS_KEY, String(hs));
      setHighScore(hs);
      setUiState({ running: false, over: true, score: s.score });
      return;
    }

    const isPerfect = Math.abs(overlapW - topBlock.width) < 5;
    const pts = isPerfect ? 50 + s.blocks.length : 10 + s.blocks.length;
    s.score += pts;

    if (sliderL < blockL) {
      s.fallChunks.push({
        x: sliderL,
        y: getBlockY(s.blocks.length, s.cameraY, canvas.height),
        width: blockL - sliderL,
        vy: 2,
        color: s.slider.color,
      });
    }
    if (sliderR > blockR) {
      s.fallChunks.push({
        x: blockR,
        y: getBlockY(s.blocks.length, s.cameraY, canvas.height),
        width: sliderR - blockR,
        vy: 2,
        color: s.slider.color,
      });
    }

    s.blocks.push({
      x: overlapL,
      width: overlapW,
      color: s.slider.color,
      level: s.blocks.length,
    });

    const textY = getBlockY(s.blocks.length - 1, s.cameraY, canvas.height);
    s.floatingTexts.push(
      isPerfect
        ? {
            text: "PERFECT NOON! +50",
            x: canvas.width / 2,
            y: textY,
            life: 1.2,
            color: "#35E6D5",
          }
        : {
            text: `+${pts}`,
            x: canvas.width / 2,
            y: textY,
            life: 0.8,
            color: "#F7C85A",
          },
    );

    const targetCamera =
      canvas.height - BASE_Y_OFFSET - BLOCK_H * (s.blocks.length + 2);
    s.cameraY = Math.max(s.cameraY, targetCamera);

    const speedIncrease = Math.min(0.25 * (s.blocks.length - 1), 3);
    const widthReduction = Math.min(0.92 ** (s.blocks.length - 1), 0.4);
    const nextWidth = Math.max(40, overlapW * (0.94 + Math.random() * 0.04));
    const nextColor = CAN_COLORS[s.blocks.length % CAN_COLORS.length];
    s.slider = {
      x: Math.random() < 0.5 ? 0 : canvas.width - nextWidth,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 2.5 + speedIncrease,
      width: nextWidth * widthReduction + nextWidth * (1 - widthReduction),
      color: nextColor,
    };
  }, [highScore]);

  const loop = useCallback(
    (ts: number) => {
      const dt = Math.min((ts - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = ts;
      const s = stateRef.current;
      if (!s || !s.running) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      s.slider.x += s.slider.dir * s.slider.speed * dt;
      if (s.slider.x + s.slider.width >= canvas.width) {
        s.slider.x = canvas.width - s.slider.width;
        s.slider.dir = -1;
      }
      if (s.slider.x <= 0) {
        s.slider.x = 0;
        s.slider.dir = 1;
      }

      s.fallChunks = s.fallChunks.filter((fc) => fc.y < canvas.height + 50);
      for (const fc of s.fallChunks) {
        fc.y += fc.vy * dt;
        fc.vy += 0.2 * dt;
      }

      s.floatingTexts = s.floatingTexts.filter((ft) => ft.life > 0);
      for (const ft of s.floatingTexts) {
        ft.life -= 0.025 * dt;
        ft.y -= 0.8 * dt;
      }

      draw();
      rafRef.current = requestAnimationFrame(loop);
    },
    [draw],
  );

  const startGame = useCallback(() => {
    stateRef.current = buildInitialState();
    lastTimeRef.current = performance.now();
    setUiState({ running: true, over: false, score: 0 });
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [buildInitialState, loop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = () => dropBlock();
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        dropBlock();
      }
    };
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [dropBlock]);

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
          cursor: "pointer",
        }}
      />
      {!uiState.running && !uiState.over && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48 }}>🫙</div>
            <h2 style={titleStyle}>HIGH NOON STACK</h2>
            <p style={descStyle}>
              Drop cans to build the highest tower.
              <br />
              Precision earns &quot;PERFECT NOON!&quot; bonuses.
              <br />
              One bad drop ends it all.
            </p>
            <p style={{ color: "rgba(53,230,213,0.8)", fontSize: 13 }}>
              Click canvas or press SPACE to drop
            </p>
            <button
              data-ocid="canstack.primary_button"
              type="button"
              style={btnStyle}
              onClick={startGame}
            >
              START STACKING
            </button>
          </div>
        </div>
      )}
      {uiState.over && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 48 }}>🫙</div>
            <h2 style={titleStyle}>TOWER COLLAPSED</h2>
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
              data-ocid="canstack.primary_button"
              type="button"
              style={btnStyle}
              onClick={startGame}
            >
              STACK AGAIN
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
