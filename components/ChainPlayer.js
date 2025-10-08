export default function ChainPlayer({ clips }) {
  return (
    <div>
      <h3>Chain Clips</h3>
      {clips && clips.length > 0 ? (
        clips.map((clip, i) => (
          <audio key={i} controls src={clip.audio_url}></audio>
        ))
      ) : (
        <p>No clips yet</p>
      )}
    </div>
  )
}