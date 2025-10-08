// pages/api/uploadClip.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ 1. Require auth
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "❌ You must be logged in" });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: "❌ Invalid or expired token" });
  }

  const { chain_id, clip_url } = JSON.parse(req.body);

  // ✅ 2. Load chain info
  const { data: chain, error: chainError } = await supabase
    .from("chains")
    .select("*")
    .eq("id", chain_id)
    .single();

  if (chainError || !chain) {
    return res.status(404).json({ error: "Chain not found" });
  }

  // ✅ 3. Rule enforcement
  if (chain.type === "friend") {
    // Check max_clips
    const { count } = await supabase
      .from("clips")
      .select("id", { count: "exact", head: true })
      .eq("chain_id", chain_id);

    if (chain.max_clips && count >= chain.max_clips) {
      return res.status(403).json({ error: "❌ Chain is full (max clips reached)" });
    }
  }

  if (chain.type === "global") {
    // Ensure one per user
    const { count } = await supabase
      .from("clips")
      .select("id", { count: "exact", head: true })
      .eq("chain_id", chain_id)
      .eq("creator_id", user.id);

    if (count > 0) {
      return res.status(403).json({ error: "❌ You already contributed to this global chain" });
    }
  }

  // ✅ 4. Insert clip
  const { data, error: insertError } = await supabase
    .from("clips")
    .insert([{ chain_id, clip_url, creator_id: user.id }])
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true, clip: data });
}
