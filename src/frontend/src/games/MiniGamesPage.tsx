import { useState } from "react";
import CanCatcher from "./CanCatcher";
import CanStack from "./CanStack";
import NoonFrenzy from "./NoonFrenzy";

interface MiniGamesPageProps {
  onBack: () => void;
  bobbyMode: boolean;
}

const GAMES = [
  {
    id: "catcher",
    name: "Noon Drop",
    emoji: "🌅",
    desc: "Catch falling High Noon cans. Dodge the bad vibes. Speed increases every 10 seconds.",
    hsKey: "noon-drop-high",
  },
  {
    id: "stack",
    name: "High Noon Stack",
    emoji: "🫙",
    desc: "Drop cans to build the tallest tower. Precision earns PERFECT NOON! bonuses.",
    hsKey: "noon-stack-high",
  },
  {
    id: "frenzy",
    name: "Noon Frenzy",
    emoji: "🎯",
    desc: "Whack-a-mole chaos. 30 seconds. Maximum vibes. Bobby combo multipliers.",
    hsKey: "noon-frenzy-high",
  },
];

export default function MiniGamesPage({
  onBack,
  bobbyMode,
}: MiniGamesPageProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const getHs = (key: string) =>
    Number.parseInt(localStorage.getItem(key) || "0", 10);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060A14",
        fontFamily: "Inter, sans-serif",
        color: "#EAF0FF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "24px 28px 0",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          position: "relative",
        }}
      >
        <button
          data-ocid="arcade.back_button"
          type="button"
          onClick={activeGame ? () => setActiveGame(null) : onBack}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1.5px solid rgba(247,200,90,0.5)",
            background: "rgba(247,200,90,0.08)",
            color: "#F7C85A",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: "0.04em",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          ← {activeGame ? "Back to Arcade" : "Back to Universe"}
        </button>

        {!activeGame && (
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(28px, 6vw, 56px)",
                fontWeight: 900,
                color: "#F7C85A",
                letterSpacing: "-0.01em",
                margin: 0,
                lineHeight: 1,
                textShadow: bobbyMode
                  ? "0 0 40px rgba(247,200,90,0.7)"
                  : "0 0 20px rgba(247,200,90,0.4)",
              }}
            >
              🕹️ BOBBY&apos;S ARCADE
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "rgba(53,230,213,0.85)",
                margin: "8px 0 0",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              Three games. Zero chill. Maximum Noon.
            </p>
          </div>
        )}

        {activeGame && (
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(20px, 4vw, 36px)",
                fontWeight: 900,
                color: "#F7C85A",
                letterSpacing: "0.02em",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {GAMES.find((g) => g.id === activeGame)?.emoji}{" "}
              {GAMES.find((g) => g.id === activeGame)?.name.toUpperCase()}
            </h1>
          </div>
        )}
      </header>

      {/* Game cards */}
      {!activeGame && (
        <main
          style={{
            flex: 1,
            padding: "40px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              width: "100%",
              maxWidth: 900,
            }}
          >
            {GAMES.map((game) => (
              <div
                key={game.id}
                data-ocid={`arcade.${game.id}.card`}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1.5px solid rgba(247,200,90,0.2)",
                  borderRadius: 20,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(247,200,90,0.6)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 40px rgba(247,200,90,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(247,200,90,0.2)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 44 }}>{game.emoji}</div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#EAF0FF",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {game.name}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(234,240,255,0.65)",
                    margin: 0,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {game.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(53,230,213,0.7)",
                      fontWeight: 600,
                    }}
                  >
                    🏆 Best: {getHs(game.hsKey)}
                  </span>
                  <button
                    data-ocid={`arcade.${game.id}.primary_button`}
                    type="button"
                    style={{
                      padding: "10px 24px",
                      borderRadius: 999,
                      border: "1.5px solid #F7C85A",
                      background: "rgba(247,200,90,0.15)",
                      color: "#F7C85A",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                    }}
                    onClick={() => setActiveGame(game.id)}
                  >
                    PLAY →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Flavor guide */}
          <div
            style={{
              marginTop: 16,
              padding: "20px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(53,230,213,0.15)",
              borderRadius: 16,
              maxWidth: 500,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(53,230,213,0.6)",
                letterSpacing: "0.08em",
                margin: "0 0 8px",
                fontWeight: 700,
              }}
            >
              HIGH NOON FLAVOR GUIDE
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, color: "rgba(234,240,255,0.7)" }}>
                🍋 Lemon = 1pt
              </span>
              <span style={{ fontSize: 13, color: "rgba(234,240,255,0.7)" }}>
                🍑 Peach = 2pts
              </span>
              <span style={{ fontSize: 13, color: "rgba(234,240,255,0.7)" }}>
                🍓 Strawberry = 3pts
              </span>
              <span style={{ fontSize: 13, color: "rgba(234,240,255,0.7)" }}>
                💀 Bad Vibe = -1 life
              </span>
            </div>
          </div>
        </main>
      )}

      {/* Active game overlay */}
      {activeGame && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "16px 20px",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: "hidden",
              border: `1.5px solid ${
                bobbyMode ? "rgba(247,200,90,0.5)" : "rgba(247,200,90,0.2)"
              }`,
              boxShadow: bobbyMode ? "0 0 40px rgba(247,200,90,0.12)" : "none",
              minHeight: 480,
              maxHeight: "80vh",
            }}
          >
            {activeGame === "catcher" && <CanCatcher bobbyMode={bobbyMode} />}
            {activeGame === "stack" && <CanStack bobbyMode={bobbyMode} />}
            {activeGame === "frenzy" && <NoonFrenzy bobbyMode={bobbyMode} />}
          </div>
        </div>
      )}
    </div>
  );
}
