// pages/api/stats.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    // Count total users
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Count total chains
    const { count: chainCount } = await supabase
      .from("chains")
      .select("*", { count: "exact", head: true });

    // Count total clips
    const { count: clipCount, data: clips } = await supabase
      .from("clips")
      .select("audio_url", { count: "exact" });

    // Estimate total storage size from clip count (average ~300KB)
    const totalMB = ((clipCount || 0) * 0.3).toFixed(1);

    res.status(200).json({
      users: userCount || 0,
      chains: chainCount || 0,
      clips: clipCount || 0,
      estimatedStorageMB: totalMB,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
