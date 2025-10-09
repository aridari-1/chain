import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";
import { mergeClips } from "../../utils/mergeAudio";
import { Settings } from "lucide-react";

export default function FriendsPage() {
  // --- state management ---
  const [mode, setMode] = useState("menu"); // menu | create | join
  const [chainId, setChainId] = useState(null);
  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [joinId, setJoinId] = useState("");

  // --- realtime refresh for active chain ---
  useEffect(() => {
    if (!chainId) return;
    refreshClips(chainId);
    const channel = supabase
      .channel("friends-chain")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clips", filter: `chain_id=eq.${chainId}` },
        () => refreshClips(chainId)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [chainId]);

  async function refreshClips(id) {
    const { data } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", id)
      .order("created_at", { ascending: true });
    setClips(data || []);
    if (data && data.length > 0) {
      const url = await mergeClips(data);
      setMergedUrl(url);
    }
  }

  // --- create new chain ---
  async function handleCreateChain() {
    const { data, error } = await supabase
      .from("chains")
      .insert([{ type: "friend", max_clips: 10 }])
      .select()
      .single();
    if (!error && data) {
      setChainId(data.id);
      setInviteLink(`${window.location.origin}/friendChain/${data.id}`);
      setMode("create");
    }
  }

  // --- join chain ---
  function handleJoin() {
    if (!joinId.trim()) {
      alert("Please paste a chain ID or link.");
      return;
    }
    const match = joinId.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    const id = match ? match[0] : joinId.trim();
    setChainId(id);
    setMode("join");
  }

  // --- copy link + manual merge (creator only) ---
  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    alert("✅ Link copied!");
  }

  async function handleManualMerge() {
    await refreshClips(chainId);
    alert("✅ All clips merged!");
  }

  // --- base UI ---
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <AnimatePresence>
        {mode === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {/* original buttons preserved */}
            <Link href="#">
              <button
                onClick={handleCreateChain}
                style={{
                  background: "white",
                  color: "#764ba2",
                  borderRadius: "50px",
                  border: "none",
                  padding: "15px 50px",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                }}
              >
                ➕ Create Friend Chain
              </button>
            </Link>

            <div style={{ textAlign: "center" }}>
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Paste join link or ID"
                style={{
                  padding: "10px",
                  borderRadius: "12px",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  width: "260px",
                  marginBottom: "10px",
                }}
              />
              <br />
              <button
                onClick={handleJoin}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid white",
                  borderRadius: "50px",
                  color: "white",
                  fontSize: "1.1rem",
                  padding: "10px 35px",
                  fontWeight: "600",
                  backdropFilter: "blur(8px)",
                }}
              >
                🔗 Join Friend Chain
              </button>
            </div>
          </motion.div>
        )}

        {/* ---- CREATE INTERFACE ---- */}
        {mode === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", position: "relative" }}
          >
            {/* top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
              }}
            >
              <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600 }}>
                Make your record in the group chain.
              </h2>

              {/* settings icon visible only for creator */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Settings color="white" size={26} />
                </button>

                {showSettings && (
                  <div
                    style={{
                      position: "absolute",
                      top: "40px",
                      right: "0",
                      background: "rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "15px",
                      backdropFilter: "blur(10px)",
                      color: "white",
                      fontSize: "0.9rem",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                      zIndex: 50,
                    }}
                  >
                    <button
                      onClick={copyLink}
                      style={{
                        background: "white",
                        color: "#764ba2",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        marginBottom: "10px",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      📋 Copy Share Link
                    </button>

                    <button
                      onClick={handleManualMerge}
                      style={{
                        background: "linear-gradient(90deg, #ff6ec4, #7873f5)",
                        border: "none",
                        color: "white",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      🎧 Merge All Clips
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* record button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "100px",
              }}
            >
              <Recorder chainId={chainId} />
            </div>

            {/* audio player */}
            <div
              style={{
                marginTop: "180px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {mergedUrl && (
                <audio
                  controls
                  src={mergedUrl}
                  style={{
                    width: "80%",
                    maxWidth: "500px",
                    borderRadius: "12px",
                  }}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ---- JOIN INTERFACE ---- */}
        {mode === "join" && (
          <motion.div
            key="join"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", position: "relative" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 20px",
              }}
            >
              <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600 }}>
                Make your record in the group chain.
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "100px",
              }}
            >
              <Recorder chainId={chainId} />
            </div>

            <div
              style={{
                marginTop: "180px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {mergedUrl && (
                <audio
                  controls
                  src={mergedUrl}
                  style={{
                    width: "80%",
                    maxWidth: "500px",
                    borderRadius: "12px",
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
