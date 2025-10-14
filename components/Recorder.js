import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recorder({ mode }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [message, setMessage] = useState("");
  const chunks = useRef([]);

  const AWS_PUBLIC_URL = process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL;

  // ✅ Check if user already recorded in the current active chain
  useEffect(() => {
    const checkExisting = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Get the most recent global chain
      const { data: chain } = await supabase
        .from("chains")
        .select("id, created_at")
        .eq("type", "global")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!chain) return;

      // If the chain has expired, user must refresh for the new one
      const expiresAt = new Date(new Date(chain.created_at).getTime() + 24 * 60 * 60 * 1000);
      if (Date.now() > expiresAt) {
        setHasRecorded(true);
        setMessage("⏳ Previous chain ended. Please refresh for the new chain.");
        return;
      }

      // Check if this user already recorded on the current chain
      const { data: existing } = await supabase
        .from("clips")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("chain_id", chain.id);

      if (existing && existing.length > 0) {
        setHasRecorded(true);
        setMessage("✅ You’ve already contributed to today’s chain!");
      } else {
        setHasRecorded(false);
      }
    };
    checkExisting();
  }, []);

  const startRecording = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setMessage("You must be logged in to record.");
      return;
    }

    // ✅ Fetch latest global chain before every recording
    const { data: chain } = await supabase
      .from("chains")
      .select("id, created_at")
      .eq("type", "global")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!chain) {
      setMessage("No active chain found. Please refresh.");
      return;
    }

    const expiresAt = new Date(new Date(chain.created_at).getTime() + 24 * 60 * 60 * 1000);
    if (Date.now() > expiresAt) {
      setMessage("⏳ Previous chain ended. Please refresh for the new chain.");
      setHasRecorded(true);
      return;
    }

    // Check if user already recorded in this chain
    const { data: existing } = await supabase
      .from("clips")
      .select("id")
      .eq("user_id", userId)
      .eq("chain_id", chain.id);

    if (existing && existing.length > 0) {
      setMessage("✅ You’ve already contributed to today’s chain!");
      setHasRecorded(true);
      return;
    }

    // ✅ Continue only if user can record
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
        const presignRes = await fetch(`/api/s3-upload?filename=${fileName}&type=audio/webm`);
        const { uploadUrl } = await presignRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "audio/webm" },
          body: blob,
        });

        await supabase.from("clips").insert([
          {
            chain_id: chain.id, // ✅ always current chain
            user_id: userId,
            audio_url: `${AWS_PUBLIC_URL}/${fileName}`,
          },
        ]);

        window.dispatchEvent(new Event("clipUploaded"));
        setHasRecorded(true);
        setMessage("✅ Uploaded successfully! Try again in the next chain.");
      } catch (err) {
        console.error("❌ Failed to upload to S3:", err);
        setMessage("❌ Failed to upload to S3: " + err.message);
      }
    };

    recorder.start();
    setRecording(true);
    setMediaRecorder(recorder);
    setMessage("🎙️ Recording...");

    // ✅ Auto-stop after 6 seconds
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
