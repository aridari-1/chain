// pages/friends/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function Friends() {
  const router = useRouter();
  const [limit, setLimit] = useState(5);
  const [creating, setCreating] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [shareId, setShareId] = useState(null);
  const [copied, setCopied] = useState(false);

  // State to toggle visibility
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  const [showInitialButtons, setShowInitialButtons] = useState(true);

  async function createChain() {
    try {
      setCreating(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        alert("Please sign in first.");
        setCreating(false);
        return;
      }
      if (limit < 5 || limit > 10) {
        alert("Limit must be between 5 and 10.");
        setCreating(false);
        return;
      }

      const { data, error } = await supabase
        .from("chains")
        .insert([{ type: "friend", max_clips: limit, creator_id: auth.user.id }])
        .select("id")
        .single();

      if (error) {
        console.error(error);
        alert("❌ Error creating chain");
        setCreating(false);
        return;
      }

      setShareId(data.id);
      setTimeout(() => router.push(`/chain/${data.id}`), 600);
    } catch (e) {
      console.error(e);
      alert("❌ Unexpected error");
    } finally {
      setCreating(false);
    }
  }

  function handleJoin() {
    const raw = (joinInput || "").trim();
    if (!raw) return;
    const match = raw.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    const id = match ? match[0] : raw;
    router.push(`/chain/${id}`);
  }

  function copyLink() {
    if (!shareId) return;
    const url = `${window.location.origin}/chain/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "friendsGradient 12s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <style>{`
        @keyframes friendsGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseButton {
          0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(255,255,255,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.8); }
        }
      `}</style>

      {/* 🌟 INITIAL VIEW — Two Centered Buttons */}
      {showInitialButtons && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              setShowInitialButtons(false);
              setShowCreateOptions(true);
            }}
            style={{
              background: "linear-gradient(90deg, #ffb6ff, #b344ff, #667eea)",
              backgroundSize: "300% 300%",
              animation: "pulseButton 3s ease-in-out infinite",
              border: "none",
              color: "white",
              fontSize: "1.3rem",
              fontWeight: 600,
              padding: "18px 50px",
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            ➕ Create a Friend Chain
          </button>

          <button
            onClick={() => {
              setShowInitialButtons(false);
              setShowJoinOptions(true);
            }}
            style={{
              background: "linear-gradient(90deg, #ff9a9e, #fad0c4, #a1c4fd)",
              backgroundSize: "300% 300%",
              animation: "pulseButton 3s ease-in-out infinite",
              border: "none",
              color: "white",
              fontSize: "1.3rem",
              fontWeight: 600,
              padding: "18px 50px",
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            🔗 Join a Friend Chain
          </button>
        </div>
      )}

      {/* Existing Logic (Unchanged) */}
      {!showInitialButtons && (
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >
          {/* CREATE SECTION */}
          {showCreateOptions && (
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: 24,
                color: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                backdropFilter: "blur(6px)",
              }}
            >
              <h1 style={{ margin: 0, fontSize: 24, alignItems: "center" }}>set your clip limits</h1>
              <p style={{ opacity: 0.9, marginTop: 8 }}>
                
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                <label style={{ fontWeight: 600 }}>Clip Limit:</label>
                <input
                  type="number"
                  min={5}
                  max={10}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  style={{
                    width: 90,
                    borderRadius: 10,
                    border: "none",
                    padding: "8px 10px",
                    textAlign: "center",
                  }}
                />
                <button
                  onClick={createChain}
                  disabled={creating}
                  style={{
                    marginLeft: "auto",
                    background: "#fff",
                    color: "#7c4ba2ff",
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 20px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>

              {shareId && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.25)",
                    padding: "8px 10px",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/chain/${shareId}`}
                  </div>
                  <button
                    onClick={copyLink}
                    style={{
                      background: "#fff",
                      color: "#764ba2",
                      border: "none",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "✅ Copied" : "📋 Copy"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* JOIN SECTION */}
          {showJoinOptions && (
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: 24,
                color: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                backdropFilter: "blur(6px)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 22 }}>🔗 Join a Friend Chain</h2>
              <p style={{ opacity: 0.9, marginTop: 8 }}>
                Enter your friend’s invite link 
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <input
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="Paste invite link "
                  style={{
                    flex: 1,
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                />
                <button
                  onClick={handleJoin}
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
                  Join
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
