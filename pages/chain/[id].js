// pages/chain/[id].js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";

export default function ChainPage() {
  const router = useRouter();
  const { id } = router.query;

  const [chain, setChain] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingAll, setPlayingAll] = useState(false);
  const audioRef = useRef(null);

  // Load chain + clips
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);

      const { data: chainData, error: chainErr } = await supabase
        .from("chains")
        .select("*")
        .eq("id", id)
        .single();

      if (chainErr) {
        console.error(chainErr);
        setLoading(false);
        return;
      }

      setChain(chainData);

      const { data: clipsData, error: clipsErr } = await supabase
        .from("clips")
        .select("*")
        .eq("chain_id", id)
        .order("created_at", { ascending: true });

      if (clipsErr) {
        console.error(clipsErr);
      } else {
        setClips(clipsData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  async function reloadClips() {
    const { data: clipsData } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", id)
      .order("created_at", { ascending: true });
    setClips(clipsData || []);
  }

  // Sequential play
  async function playAll() {
    if (!clips.length) return;
    setPlayingAll(true);

    for (let i = 0; i < clips.length; i++) {
      const audio = new Audio(clips[i].audio_url);
      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.play().catch(resolve);
      });
    }

    setPlayingAll(false);
  }

  const shareLink =
    typeof window !== "undefined" ? `${window.location.origin}/chain/${id}` : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "chainGradient 12s ease infinite",
        fontFamily: "Poppins, sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes chainGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {loading ? (
        <h2>Loading chain...</h2>
      ) : !chain ? (
        <h2>❌ Chain not found.</h2>
      ) : (
        <>
          <h1 style={{ marginTop: 10 }}>
            {chain.type === "friend" ? "🤝 Friend Chain" : "🌍 Global Chain"}
          </h1>

          {chain.type === "friend" && (
            <div
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.15)",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <p style={{ marginBottom: 8 }}>
                📤 <b>Share this link with your friends:</b>
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.25)",
                  padding: "6px 10px",
                  borderRadius: 10,
                }}
              >
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: "500",
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert("✅ Link copied!");
                  }}
                  style={{
                    background: "#fff",
                    color: "#764ba2",
                    border: "none",
                    borderRadius: 10,
                    padding: "6px 10px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 20,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 700,
              textAlign: "center",
            }}
          >
            <h3>🎤 Record Your Clip</h3>
            <Recorder chainId={id} mode={chain.type} />
          </div>

          <div
            style={{
              marginTop: 30,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 700,
              textAlign: "center",
            }}
          >
            <h3>🎧 All Clips ({clips.length})</h3>

            {clips.length === 0 ? (
              <p>No clips yet — be the first to record!</p>
            ) : (
              <>
                <div style={{ marginTop: 15 }}>
                  <button
                    onClick={playAll}
                    disabled={playingAll}
                    style={{
                      background: "#fff",
                      color: "#764ba2",
                      border: "none",
                      borderRadius: 999,
                      padding: "10px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {playingAll ? "🔊 Playing..." : "▶️ Play All"}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gap: 12,
                    justifyItems: "center",
                  }}
                >
                  {clips.map((clip, i) => (
                    <audio
                      key={clip.id}
                      src={clip.audio_url}
                      controls
                      style={{
                        width: "100%",
                        maxWidth: 600,
                        borderRadius: 10,
                        background: "#fff",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
