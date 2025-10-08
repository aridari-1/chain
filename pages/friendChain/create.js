import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function CreateFriendChain() {
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate() {
    setError("");
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("❌ You must be logged in to create a chain.");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("chains")
      .insert([{ type: "friend", max_clips: limit, creator_id: user.id }])
      .select()
      .single();

    if (insertError) {
      setError("❌ Failed to create chain: " + insertError.message);
      setLoading(false);
      return;
    }

    // Redirect to the new chain page
    router.push(`/friendChain/${data.id}`);
  }

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>➕ Create Friend Chain</h1>
      <p>Set the maximum number of clips (between 5 and 100):</p>
      <input
        type="number"
        min="5"
        max="100"
        value={limit}
        onChange={(e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val)) val = 5;
          if (val < 5) val = 5;
          if (val > 100) val = 100;
          setLimit(val);
        }}
        style={{ padding: "8px", margin: "12px" }}
      />
      <br />
      <button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Chain"}
      </button>
      {error && <div className="banner error" style={{ marginTop: "10px" }}>{error}</div>}
    </div>
  );
}
