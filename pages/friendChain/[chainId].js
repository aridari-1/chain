// pages/friendChain/[chainId].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";
import { mergeClips } from "../../utils/mergeAudio";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

export default function FriendChainPage() {
  const router = useRouter();
  const { chainId, joined } = router.query;

  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // 🔹 Load all clips + share link
  useEffect(() => {
    if (!chainId) return;
    setInviteLink(`${window.location.origin}/friendChain/${chainId}`);
    refreshClips(chainId);

    // Real-time auto-refresh when new clips are added
    const channel = supabase
      .channel("clips-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clips", filter: `chain_id=eq.${chainId}` },
        () => refreshClips(chainId)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [chainId]);

  // 🔹 Fetch and merge clips
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

  // 🔹 Copy share link
  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    alert("✅ Link copied to clipboard!");
  }

  // 🔹 Force manual merge (in Settings)
  async function handleManualMerge() {
    await refreshClips(chainId);
    alert("✅ All clips merged successfully!");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* 🔹 Top bar */}
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

        {/* Settings icon */}
        {!joined && (
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

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 🔹 Record button centered */}
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

      {/* 🔹 Merged audio player */}
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
    </div>
  );
}
