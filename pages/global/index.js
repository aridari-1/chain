import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function GlobalChain() {
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClips();
  }, []);

  async function fetchClips() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", "global");
    if (!error) setClips(data || []);
    setIsLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🌍 Global Chain</h1>
      <p style={{ opacity: 0.9, marginBottom: "30px", textAlign: "center", maxWidth: "400px" }}>
        Record once and become part of the global voice chain.  
        Every user contributes a single clip — together, it’s one global story.
      </p>

      <button
        style={{
          background: "white",
          color: "#764ba2",
          padding: "15px 50px",
          border: "none",
          borderRadius: "40px",
          cursor: "pointer",
          fontSize: "1.1rem",
          fontWeight: "600",
          transition: "transform 0.3s ease",
          marginBottom: "40px",
        }}
        onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
      >
        🎙️ Record My Global Voice
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>All Global Voices</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : clips.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>No recordings yet. Be the first!</p>
        ) : (
          clips.map((clip, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                🎤 {clip.user_id?.slice(0, 8)}...
              </p>
              <audio
                controls
                src={clip.audio_url}
                style={{ width: "100%", marginTop: "8px", borderRadius: "10px" }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
