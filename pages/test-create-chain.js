// pages/test-create-chain.js
import { useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { supabase } from "../lib/supabaseClient";

export default function TestCreateChain() {
  const [out, setOut] = useState("Click a button to test.");

  async function showUser() {
    const { data } = await supabase.auth.getUser();
    setOut(JSON.stringify(data?.user ?? null, null, 2));
  }

  async function createFriendChain() {
    try {
      const res = await fetchWithAuth("/api/chains", {
        method: "POST",
        body: JSON.stringify({ type: "friend", max_clips: 5 }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut("Error: " + e.message);
    }
  }

  async function createGlobalChain() {
    try {
      const res = await fetchWithAuth("/api/chains", {
        method: "POST",
        body: JSON.stringify({ type: "global", max_clips: null }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut("Error: " + e.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h1>Test Chains API</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={showUser}>Show user</button>
        <button onClick={createFriendChain}>Create Friend Chain</button>
        <button onClick={createGlobalChain}>Create Global Chain</button>
      </div>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 6, whiteSpace: "pre-wrap" }}>
        {out}
      </pre>
    </div>
  );
}
