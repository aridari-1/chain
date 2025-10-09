import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";
import { mergeClips } from "../../utils/mergeAudio";

export default function JoinFriendChain() {
  const router = useRouter();
  const { chainId } = router.query;

  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);

  // 🔹 Load all clips + auto-refresh
  useEffect(() => {
    if (!chainId) return;
    refreshClips(chainId);

    const channel = supabase
      .channel("join-clips")
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
      {/* 🔹 Top message only */}
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

      {/* 🔹 List all clips */}
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
    </div>
  );
}
