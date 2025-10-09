import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recorder({ chainId }) {
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ✅ Prefer mp4 for iOS; fallback to webm for others
      const options = { mimeType: "audio/mp4" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "audio/webm";
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const fileExt = mediaRecorder.mimeType.includes("mp4") ? "m4a" : "webm";
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("clips")
          .upload(fileName, blob, { upsert: true });

        if (!error) {
          const { data: publicUrl } = supabase.storage.from("clips").getPublicUrl(fileName);
          await supabase.from("clips").insert([{ chain_id: chainId, audio_url: publicUrl.publicUrl }]);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setCountdown(6);

      // 6-second countdown
      let time = 6;
      const timer = setInterval(() => {
        time -= 1;
        setCountdown(time);
        if (time <= 0) {
          clearInterval(timer);
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Unable to access microphone");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    setRecording(false);
    setCountdown(0);
  }

  return (
    <div style={{ textAlign: "center" }}>
      {!recording ? (
        <button
          onClick={startRecording}
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "18px 36px",
            border: "none",
            borderRadius: "50%",
            fontSize: "1.2rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          🎤
        </button>
      ) : (
        <button
          onClick={stopRecording}
          style={{
            background: "#E53935",
            color: "white",
            padding: "18px 36px",
            border: "none",
            borderRadius: "50%",
            fontSize: "1.2rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          ⏹
        </button>
      )}
      {recording && (
        <div style={{ color: "white", marginTop: "10px", fontSize: "1rem" }}>
          {countdown}s
        </div>
      )}
    </div>
  );
}
