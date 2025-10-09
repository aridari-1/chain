import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";
import { mergeClips } from "../../utils/mergeAudio";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

export default function CreateFriendChain() {
  const router = useRouter();
  const [chainId, setChainId] = useState(null);
  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // 🔹 Create a new chain when page loads
  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase
        .from("chains")
        .insert([{ type: "friend", creator_id: user?.id }])
        .select("id")
        .single();
      if (!error && data) setChainId(data.id);
    })();
  }, []);

  // 🔹 Load clips + real-time updates
  useEffect(() => {
    if (!chainId) return;
    setInviteLink(`${window.location.origin}/friendChain/${chainId}`);
    refreshClips(chainId);

    const channel = supabase
      .channel("create-clips")
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
  }

  async function handleManualMerge() {
    if (!clips.length) return alert("No clips to merge yet.");
    const url = await mergeClips(clips);
    setMergedUrl(url);
    alert("✅ All clips merged successfully!");
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    alert("✅ Link copied to clipboard!");
  }

  if (!chainId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        Creating your chain...
      </div>
    );
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
      {/* 🔹 Top bar with message + settings */}
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

        {/* ⚙️ Settings icon */}
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
      </div>

      {/* 🔹 Record button centered */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "80px",
        }}
      >
        <Recorder chainId={chainId} />
      </div>

      {/* 🔹 All clips list (each playable) */}
      <div
        style={{
          marginTop: "140px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {clips.length === 0 && (
          <p style={{ color: "white", opacity: 0.8 }}>No clips yet.</p>
        )}
        {clips.map((clip) => (
          <audio
            key={clip.id}
            controls
            src={clip.audio_url}
            style={{
              width: "80%",
              maxWidth: "500px",
              borderRadius: "10px",
            }}
          />
        ))}
      </div>

      {/* 🔹 Merged audio shown only after pressing merge */}
      {mergedUrl && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <audio
            controls
            src={mergedUrl}
            style={{
              width: "80%",
              maxWidth: "500px",
              borderRadius: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
}
