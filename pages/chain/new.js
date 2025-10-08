import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Recorder({ chainId, chainType, session }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // ✅ Start recording
  async function startRecording() {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      setMessage("❌ Microphone error: " + err.message);
    }
  }

  // ✅ Stop recording
  function stopRecording() {
    mediaRecorderRef.current.stop();
    setRecording(false);
  }

  // ✅ Handle finished recording
  async function handleStop() {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];
    const url = URL.createObjectURL(blob);
    setAudioURL(url);

    // Upload to Supabase Storage
    const filename = `${session.user.id}-${Date.now()}.webm`;
    const { data, error: uploadError } = await supabase.storage
      .from("clips")
      .upload(filename, blob);

    if (uploadError) {
      setMessage("❌ Upload failed: " + uploadError.message);
      return;
    }

    const audio_url = supabase.storage.from("clips").getPublicUrl(filename).publicURL;

    // Call API to save metadata
    try {
      const res = await fetch("/api/upload-clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // ✅ Auth header
        },
        body: JSON.stringify({ chain_id: chainId, audio_url }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.code === "ALREADY_UPLOADED") {
          setMessage("⚠️ You already uploaded to this Global Chain.");
        } else if (result.code === "CHAIN_FULL") {
          setMessage("⚠️ This Friend Chain is full.");
        } else {
          setMessage("❌ Error: " + result.error);
        }
      } else {
        setMessage("✅ Clip uploaded successfully!");
      }
    } catch (err) {
      setMessage("❌ Request failed: " + err.message);
    }
  }

  return (
    <div className="p-4 border rounded-xl shadow bg-white">
      <h2 className="text-lg font-semibold mb-2">🎤 Recorder</h2>
      <div className="flex space-x-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700"
          >
            Stop
          </button>
        )}
      </div>

      {audioURL && (
        <div className="mt-3">
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm font-medium text-gray-700 whitespace-pre-wrap">
          {message}
        </p>
      )}
    </div>
  );
}
