// utils/mergeAudio.js
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export async function mergeClips(clips) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffers = [];

    // --- Download & decode all clips ---
    for (const clip of clips) {
      const res = await fetch(clip.audio_url);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      buffers.push(audioBuffer);
    }

    // --- Combine sequentially ---
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const merged = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
    let offset = 0;
    for (const b of buffers) {
      merged.getChannelData(0).set(b.getChannelData(0), offset);
      offset += b.length;
    }

    // --- Convert to WAV (float PCM) ---
    const wavData = audioBufferToWav(merged);
    const wavBlob = new Blob([new DataView(wavData)], { type: "audio/wav" });

    // --- Compress using ffmpeg.wasm to MP3 ---
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write wav to ffmpeg virtual FS
    await ffmpeg.writeFile("input.wav", await fetchFile(wavBlob));

    // Re-encode to MP3 at 128 kbps
    await ffmpeg.exec([
      "-i", "input.wav",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "1",
      "output.mp3"
    ]);

    const mp3Data = await ffmpeg.readFile("output.mp3");
    const mp3Blob = new Blob([mp3Data.buffer], { type: "audio/mpeg" });

    // Return playable Object URL
    return URL.createObjectURL(mp3Blob);
  } catch (err) {
    console.error("Merge/compress error:", err);
    return null;
  }
}

// --- Simple WAV encoder helper ---
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  let pos = 0;

  function writeString(s) {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
    pos += s.length;
  }
  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString("data");
  setUint32(length - pos - 4);

  const channels = [];
  for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));

  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      pos += 2;
    }
    offset++;
  }

  return bufferArray;
}
