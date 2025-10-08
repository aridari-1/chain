import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";
import { mergeClips } from "../../utils/mergeAudio";

export default function FriendChainPage() {
  const router = useRouter();
  const { chainId, joined } = router.query;

  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (!chainId) return;
    refreshClips(chainId);
    setInviteLink(`${window.location.origin}/friendChain/${chainId}`);
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Record / Stop Button */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <Recorder chainId={chainId} />
      </div>

      {/* Merged Audio */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          textAlign: "right",
        }}
      >
        {mergedUrl && <audio controls src={mergedUrl} />}
      </div>

      {/* Share Link (hidden for joined users) */}
      {!joined && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          <p>Share this link:</p>
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "6px 10px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{inviteLink}</span>
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              style={{
                background: "white",
                color: "#764ba2",
                border: "none",
                borderRadius: "8px",
                padding: "4px 8px",
                fontWeight: "600",
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
