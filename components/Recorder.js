// components/Recorder.js
import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recorder({ chainId, onUploaded }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fileName = `clip_${Date.now()}.webm`;

        const { data, error } = await supabase.storage
          .from("clips")
          .upload(fileName, blob);

        if (error) {
          alert("❌ Upload failed");
          setStatus("");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("clips").getPublicUrl(fileName);

        const { error: insertError } = await supabase.from("clips").insert({
          chain_id: chainId,
          audio_url: publicUrl,
        });

        if (insertError) {
          alert("❌ Failed to save clip info");
          setStatus("");
          return;
        }

        setStatus("✅ Recording saved successfully!");
        if (onUploaded) onUploaded();
        setTimeout(() => setStatus(""), 2500);
      };

      // start recording
      mediaRecorder.start();
      setRecording(true);
      setStatus("🎙️ Recording... (6 s max)");

      // ⏱ auto-stop after 6 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording();
        }
      }, 6000);
    } catch (err) {
      alert("Please allow microphone access.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setStatus("⏹ Processing...");
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={recording ? stopRecording : startRecording}
        style={{
          background: recording
            ? "linear-gradient(90deg, #ff9a9e, #fad0c4, #a1c4fd)"
            : "linear-gradient(90deg, #ffb6ff, #b344ff, #667eea)",
          backgroundSize: "300% 300%",
          animation: recording
            ? "pulseActive 1.2s ease-in-out infinite"
            : "pulseIdle 3s ease-in-out infinite",
          border: "none",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: 700,
          padding: "15px 40px",
          borderRadius: "50px",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          transition: "all 0.3s ease",
        }}
      >
        {recording ? "⏹ Stop" : "🎙️ Record"}
      </button>

      {status && (
        <p style={{ marginTop: "10px", fontSize: "0.9rem", opacity: 0.9 }}>
          {status}
        </p>
      )}

      <style>{`
        @keyframes pulseIdle {
          0%,100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.8); }
        }
        @keyframes pulseActive {
          0%,100% { transform: scale(1); box-shadow: 0 0 15px rgba(255,255,255,0.6); }
          50% { transform: scale(1.12); box-shadow: 0 0 35px rgba(255,255,255,1); }
        }
      `}</style>
    </div>
  );
}
