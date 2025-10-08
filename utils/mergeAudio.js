// Merge multiple audio clips into a single WAV file for playback
export async function mergeClips(clips) {
  if (!clips || clips.length === 0) return null;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let totalDuration = 0;
  const buffers = [];

  // Fetch + decode each clip
  for (const clip of clips) {
    try {
      const response = await fetch(clip.audio_url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      buffers.push(audioBuffer);
      totalDuration += audioBuffer.duration;
    } catch (err) {
      console.error("❌ Failed to fetch or decode clip:", clip.audio_url, err);
    }
  }

  if (buffers.length === 0) return null;

  // Create one big buffer
  const output = audioContext.createBuffer(
    1,
    totalDuration * audioContext.sampleRate,
    audioContext.sampleRate
  );

  // Copy each clip into the big buffer
  let offset = 0;
  for (const buffer of buffers) {
    output.getChannelData(0).set(buffer.getChannelData(0), offset);
    offset += buffer.length;
  }

  // Export merged audio as Blob URL
  const merged = audioBufferToWav(output);
  return URL.createObjectURL(new Blob([merged], { type: "audio/wav" }));
}

// Helper: convert AudioBuffer → WAV ArrayBuffer
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels,
    length = buffer.length * numOfChan * 2 + 44,
    bufferArray = new ArrayBuffer(length),
    view = new DataView(bufferArray),
    channels = [],
    sampleRate = buffer.sampleRate;

  let offset = 0;

  function writeString(s) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
    offset += s.length;
  }

  function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  // WAV header
  writeString("RIFF");
  view.setUint32(offset, 36 + buffer.length * numOfChan * 2, true);
  offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, numOfChan, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * numOfChan * 2, true);
  offset += 4;
  view.setUint16(offset, numOfChan * 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString("data");
  view.setUint32(offset, buffer.length * numOfChan * 2, true);
  offset += 4;

  // Write interleaved data
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < numOfChan; j++) {
      floatTo16BitPCM(view, offset, channels[j].subarray(i, i + 1));
    }
  }

  return bufferArray;
}
