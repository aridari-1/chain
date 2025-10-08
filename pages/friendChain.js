import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Recorder from "../../components/Recorder";

export default function FriendChain() {
  const router = useRouter();
  const { chainId } = router.query;

  const [clips, setClips] = useState([]);
  const [userId, setUserId] = useState(null);
  const [chainMeta, setChainMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      if (chainId) {
        const { data: chainRow } = await supabase
          .from("chains")
          .select("id, type, max_clips, created_at")
          .eq("id", chainId)
          .single();

        if (!chainRow) {
          setNotFound(true);
        } else {
          setChainMeta(chainRow);
          await refreshClips(chainId);
          setInviteLink(`${window.location.origin}/friendChain/${chainId}`);
        }
      }
      setLoading(false);
    }
    loadAll();
  }, [chainId]);

  async function refreshClips(id = chainId) {
    if (!id) return;
    const { data } = await supabase
      .from("clips")
      .select("*")
      .eq("chain_id", id)
      .order("created_at", { ascending: true });
    setClips(data || []);
  }

  const used = clips.length;
  const limit = chainMeta?.max_clips ?? null;
  const isFull = limit && used >= limit;

  return (
    <div className="container">
      <h1>👥 Friend Chain</h1>

      {notFound && (
        <div className="banner error">❌ This Friend Chain does not exist.</div>
      )}

      {inviteLink && (
        <div className="banner success">
          ✅ Share this link with your friends: <br />
          <a href={inviteLink}>{inviteLink}</a>
        </div>
      )}

      {chainMeta && (
        <p style={{ marginTop: 4 }}>
          {limit ? `Clips used: ${used} / ${limit}` : `Clips used: ${used}`}
        </p>
      )}

      {isFull && (
        <div className="banner error">
          ❌ This chain is full. No more recordings allowed.
        </div>
      )}

      {!loading && userId && chainId && !isFull && !notFound && (
        <div className="card">
          <Recorder
            chainId={chainId}
            userId={userId}
            onUploaded={() => refreshClips(chainId)}
            allowMultiple={true}
            enforceMaxClips={!!limit}
          />
        </div>
      )}

      {!notFound && (
        <div className="card">
          <h2>All Clips</h2>
          {clips.length === 0 && <p>No clips yet. Be the first to record!</p>}
          {clips.map((clip, idx) => (
            <div
              key={clip.id}
              style={{
                marginBottom: 12,
                padding: "12px",
                background: "#f3f4f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: "500" }}>Clip {idx + 1}</span>
              <audio controls src={clip.audio_url} style={{ marginLeft: "15px" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
