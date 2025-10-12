// utils/mergeAudio.js
// ✅ Merges multiple short clips into a single clean WAV file with stereo/mono auto-detection

export async function mergeClips(clips) {
  try {
    if (!clips || clips.length === 0) return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    // ✅ Force consistent sample rate to prevent distortion
    const audioCtx = new AudioCtx({ sampleRate: 48000 });

    // Decode all clips
    const buffers = await Promise.all(
      clips.map(async (clip) => {
        const res = await fetch(clip.audio_url);
        const arr = await res.arrayBuffer();
        return await audioCtx.decodeAudioData(arr);
      })
    );

    // ✅ Detect max channel count (1 for mono, 2 for stereo)
    const numChannels = Math.max(...buffers.map((b) => b.numberOfChannels));

    // ✅ Calculate total samples across all buffers
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);

    // ✅ Create output buffer with proper number of channels
    const outputBuffer = audioCtx.createBuffer(
      numChannels,
      totalLength,
      audioCtx.sampleRate
    );

    // ✅ Copy data for each channel sequentially
    let offset = 0;
    for (const buffer of buffers) {
      for (let ch = 0; ch < numChannels; ch++) {
        const outData = outputBuffer.getChannelData(ch);
        const inData =
          buffer.numberOfChannels > ch
            ? buffer.getChannelData(ch)
            : buffer.getChannelData(0); // duplicate mono to both channels if needed
        outData.set(inData, offset);
      }
      offset += buffer.length;
    }

    // ✅ Convert AudioBuffer → WAV Blob
    const wavBlob = audioBufferToWav(outputBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (err) {
    console.error("❌ mergeClips error:", err);
    return null;
  }
}

// ✅ Helper: Convert AudioBuffer → WAV Blob safely
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const bufferLength = 44 + numFrames * blockAlign;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeUTFBytes(view, 0, "RIFF");
  view.setUint32(4, 36 + numFrames * blockAlign, true);
  writeUTFBytes(view, 8, "WAVE");
  writeUTFBytes(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeUTFBytes(view, 36, "data");
  view.setUint32(40, numFrames * blockAlign, true);

  // ✅ Write PCM samples (supports stereo/mono)
  let offset = 44;
  const channelData = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeUTFBytes(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
