// pages/api/cleanup.js
export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://awfweymlejtjqpboalpw.functions.supabase.co/cleanup_old_clips"
    );

    const data = await response.json();
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("Cleanup error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
