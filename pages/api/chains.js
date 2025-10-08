// pages/api/chains.js
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

  // ✅ FIXED — no JSON.parse needed
  const { type, max_clips } = req.body;

  // ✅ Validate type
  if (type !== "friend") {
    return res.status(400).json({ error: "❌ Only friend chains can be created here" });
  }

  // ✅ Validate max_clips (5–100)
  if (
    typeof max_clips !== "number" ||
    max_clips < 5 ||
    max_clips > 100
  ) {
    return res.status(400).json({ error: "❌ max_clips must be a number between 5 and 100" });
  }

  // ✅ Insert Friend Chain
  const { data, error: insertError } = await supabase
    .from("chains")
    .insert([{ type: "friend", max_clips, creator_id: user.id }])
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({ success: true, chain: data });
}
