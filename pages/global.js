import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Recorder from "../components/Recorder";
import { mergeClips } from "../utils/mergeAudio";

export default function GlobalChain() {
  const [chainId, setChainId] = useState(null);
  const [mergedUrl, setMergedUrl] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chains")
        .select("id")
        .eq("type", "global")
        .limit(1)
        .maybeSingle();
      if (data?.id) {
        setChainId(data.id);
        refreshClips(data.id);
      }
    })();
  }, []);

  async function refreshClips(id) {
    const { data } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", id)
      .order("created_at", { ascending: true });
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
      }}
    >
      {chainId && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <Recorder chainId={chainId} mode="global" />
        </div>
      )}

      {mergedUrl && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <audio controls src={mergedUrl} />
        </div>
      )}
    </div>
  );
}
