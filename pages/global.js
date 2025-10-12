import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import Recorder from "../components/Recorder";
import { mergeClips } from "../utils/mergeAudio";

export default function GlobalChain() {
  const [chainId, setChainId] = useState(null);
  const [clips, setClips] = useState([]);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const AWS_PUBLIC_URL = process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("chains")
        .select("id")
        .eq("type", "global")
        .limit(1)
        .maybeSingle();

      if (error) console.error(error);

      if (data?.id) {
        setChainId(data.id);
        await loadClips(data.id);
      } else {
        const { data: created, error: insertError } = await supabase
          .from("chains")
          .insert([{ type: "global" }])
          .select()
          .single();

        if (insertError) console.error(insertError);
        if (created?.id) setChainId(created.id);
      }

      setLoading(false);
    })();
  }, []);

  async function loadClips(id) {
    const { data } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", id)
      .order("created_at", { ascending: true });

    if (!data) return;

    const updated = data.map((clip) => ({
      ...clip,
      audio_url: clip.audio_url.startsWith("http")
        ? clip.audio_url
        : `${AWS_PUBLIC_URL}/${clip.audio_url}`,
    }));

    setClips(updated);

    if (updated.length > 0) {
      const url = await mergeClips(updated);
      setMergedUrl(url);
    }
  }

  // ✅ Auto-refresh when a new clip uploads manually (existing logic)
  useEffect(() => {
    const handleNewClip = () => {
      if (chainId) loadClips(chainId);
    };
    window.addEventListener("clipUploaded", handleNewClip);
    return () => window.removeEventListener("clipUploaded", handleNewClip);
  }, [chainId]);

  // ✅ NEW: Supabase Realtime subscription (auto merge for all users)
  useEffect(() => {
    if (!chainId) return;

    const channel = supabase
      .channel("realtime:clips")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clips" },
        (payload) => {
          console.log("📡 New clip added:", payload.new);
          loadClips(chainId); // auto-refresh and re-merge
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chainId]);

  return (
    <div
      className="global-container"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientMove 12s ease infinite",
        display: "flex",
        justifyContent: "center",
        padding: "40px 15px",
        fontFamily: "Poppins, sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ✅ Static logo + app name at top-right */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.15)",
          padding: "6px 12px",
          borderRadius: "40px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <Image
          src="/chain-logo.png"
          alt="Chain Logo"
          width={30}
          height={30}
          style={{ borderRadius: "50%" }}
        />
        <span style={{ fontSize: "1rem", fontWeight: 600 }}>Chain</span>
      </div>

      <div
        className="global-card"
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "22px",
          padding: "25px 18px",
          color: "#fff",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          marginTop: "60px",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "1.9rem",
            lineHeight: "1.3",
          }}
        >
          Add your voice to the world 🌍
        </h1>

        <p/>
          

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            <Recorder chainId={chainId} mode="global" />

            <div
              style={{
                marginTop: "40px",
                borderTop: "1px solid rgba(255,255,255,0.25)",
                paddingTop: "25px",
              }}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>
                🎧 All Voices
              </h2>

              {mergedUrl ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "16px",
                    padding: "15px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <audio
                    controls
                    src={mergedUrl}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      outline: "none",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.9rem",
                      marginTop: "8px",
                      opacity: 0.8,
                    }}
                  >
                    {clips.length} voices linked
                  </p>
                </div>
              ) : (
                <p style={{ opacity: 0.8, fontSize: "0.95rem" }}>
                  No voices yet. Be the first!
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ✅ Mobile responsive styles */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 600px) {
          h1 { font-size: 1.6rem !important; line-height: 1.4; }
          h2 { font-size: 1.2rem !important; }
          p { font-size: 0.95rem !important; }
          audio { width: 100% !important; }
          .global-card {
            padding: 18px 12px !important;
            border-radius: 18px !important;
          }
          body, html {
            overflow-x: hidden !important;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
