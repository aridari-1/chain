// pages/api/global-chain.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ Require auth
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

  // ✅ 1. Look for an existing global chain
  const { data: existing, error: findErr } = await supabase
    .from("chains")
    .select("*")
    .eq("type", "global")
    .limit(1)
    .maybeSingle();

  if (findErr) {
    console.error(findErr);
    return res.status(500).json({ error: findErr.message });
  }

  // ✅ 2. If found, return it
  if (existing) {
    return res.status(200).json({ success: true, chain: existing });
  }

  // ✅ 3. Otherwise, create it
  const { data: created, error: insertErr } = await supabase
    .from("chains")
    .insert([{ type: "global", max_clips: null, creator_id: user.id }])
    .select()
    .single();

  if (insertErr) {
    console.error(insertErr);
    return res.status(500).json({ error: insertErr.message });
  }

  return res.status(200).json({ success: true, chain: created });
}
