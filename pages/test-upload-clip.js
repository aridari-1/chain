import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient"; // make sure this file exists
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function TestUploadClip() {
  const [status, setStatus] = useState("Idle");
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  async function startRecording() {
    setStatus("Recording...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const fileName = `clip-${Date.now()}.webm`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("clips")
        .upload(fileName, audioBlob, {
          contentType: "audio/webm",
          upsert: true,
        });

      if (error) {
        setStatus("❌ Upload failed: " + error.message);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("clips").getPublicUrl(fileName);

      setAudioUrl(publicUrl);

      // Insert into DB using your provided chainId
      const chainId = "fbd37a52-bfa4-4d15-a43e-f13e90d61260";
      const res = await fetchWithAuth("/api/uploadClip", {
        method: "POST",
        body: JSON.stringify({
          chain_id: chainId,
          clip_url: publicUrl,
        }),
      });

      const dbResult = await res.json();
      if (dbResult.error) {
        setStatus("❌ DB insert failed: " + dbResult.error);
      } else {
        setStatus("✅ Clip saved successfully!");
      }
    };

    mediaRecorderRef.current.start();
  }

  // Stop recording
  function stopRecording() {
    setStatus("Processing...");
    mediaRecorderRef.current.stop();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>🎤 Test Upload Clip</h1>
      <p>Status: {status}</p>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording} style={{ marginLeft: "10px" }}>
        Stop Recording
      </button>
      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Preview:</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
}
