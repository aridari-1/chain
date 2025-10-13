import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// ✅ Permanent global chain ID
const GLOBAL_CHAIN_ID = "4a6328ce-89cc-45db-9960-320fe932976a";

export default function Recorder({ mode }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [message, setMessage] = useState("");
  const chunks = useRef([]);

  const AWS_PUBLIC_URL = process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL;

  // ✅ Initial check when component mounts
  useEffect(() => {
    const checkExisting = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data } = await supabase
          .from("clips")
          .select("id, created_at")
          .eq("user_id", userData.user.id)
          .eq("chain_id", GLOBAL_CHAIN_ID)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const lastClip = data[0];
          const clipTime = new Date(lastClip.created_at);
          const now = new Date();
          const diffHours = (now - clipTime) / (1000 * 60 * 60);

          if (diffHours < 24) {
            setHasRecorded(true);
            setMessage("✅ You have already contributed. Try again after 24h.");
          } else {
            await supabase.from("clips").delete().eq("id", lastClip.id);
            setHasRecorded(false);
          }
        }
      }
    };
    checkExisting();
  }, []);

  // ✅ Start recording with live 24-hour verification
  const startRecording = async () => {
    // Re-check Supabase every time user clicks record
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMessage("You must be logged in to record.");
      return;
    }

    const { data: existing } = await supabase
      .from("clips")
      .select("created_at")
      .eq("user_id", userId)
      .eq("chain_id", GLOBAL_CHAIN_ID)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const lastClipTime = new Date(existing[0].created_at);
      const diffHours = (Date.now() - lastClipTime) / (1000 * 60 * 60);
      if (diffHours < 24) {
        setMessage("✅ You have already contributed. Try again after 24h.");
        setHasRecorded(true);
        return;
      }
    }

    // ✅ Continue only if user hasn't recorded in 24 h
    setHasRecorded(false);
    setMessage("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const localChunks = [];

    recorder.ondataavailable = (e) => localChunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(localChunks, { type: "audio/webm" });
      const fileName = `clip-${Date.now()}.webm`;

      try {
        // Upload to S3 via presigned URL
        const presignRes = await fetch(`/api/s3-upload?filename=${fileName}&type=audio/webm`);
        const { uploadUrl } = await presignRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "audio/webm" },
          body: blob,
        });

        await supabase.from("clips").insert([
          {
            chain_id: GLOBAL_CHAIN_ID,
            user_id: userId,
            audio_url: `${AWS_PUBLIC_URL}/${fileName}`,
          },
        ]);

        window.dispatchEvent(new Event("clipUploaded"));
        setHasRecorded(true);
        setMessage("✅ Uploaded successfully! Try after 24h.");
      } catch (err) {
        console.error("❌ Failed to upload to S3:", err);
        setMessage("❌ Failed to upload to S3: " + err.message);
      }
    };

    recorder.start();
    setRecording(true);
    setMediaRecorder(recorder);
    setMessage("🎙️ Recording...");

    // ✅ Stop automatically after 6 seconds
    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
        setRecording(false);
        setMessage("Recording stopped (6s limit).");
      }
    }, 6000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setRecording(false);
      setMessage("Recording stopped manually.");
    }
  };

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      {!hasRecorded ? (
        <>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                background: "white",
                color: "#764ba2",
                padding: "14px 35px",
                borderRadius: "40px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                background: "#ff6ec4",
                color: "white",
                padding: "14px 35px",
                borderRadius: "40px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              ⏹️ Stop
            </button>
          )}
        </>
      ) : (
        <p style={{ marginTop: "20px", opacity: 0.9 }}>{message}</p>
      )}
    </div>
  );
}
