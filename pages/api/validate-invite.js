import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chain_id, invite_token } = req.body;
  if (!chain_id) return res.status(400).json({ error: "Missing chain_id" });

  const { data: chain } = await supabase
    .from("chains")
    .select("type")
    .eq("id", chain_id)
    .maybeSingle();

  if (!chain) return res.status(404).json({ error: "Chain not found" });
  if (chain.type === "global") return res.status(200).json({ valid: true });

  if (!invite_token) {
    return res.status(403).json({ valid: false, message: "Invite required" });
  }

  const { data } = await supabase
    .from("invites")
    .select("id")
    .eq("chain_id", chain_id)
    .eq("invite_token", invite_token)
    .maybeSingle();

  res.status(200).json({ valid: !!data });
}
