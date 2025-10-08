import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "❌ You must be logged in" });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "❌ Invalid or expired token" });
  }

  const { chainId } = req.body;
  const inviteToken = randomBytes(8).toString("hex");

  const { data, error: insertError } = await supabase
    .from("invites")
    .insert([{ chain_id: chainId, invite_token: inviteToken, creator_id: user.id }])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({
    success: true,
    inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL}/join/${inviteToken}`,
    invite: data,
  });
}
