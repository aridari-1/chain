import { useState } from "react";
import { useRouter } from "next/router";

export default function JoinFriendChain() {
  const [link, setLink] = useState("");
  const router = useRouter();

  function handleJoin() {
    const match = link.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    const id = match ? match[0] : link.trim();
    if (!id) return alert("❌ Invalid link or ID");
    router.push(`/friendChain/${id}?joined=true`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Paste chain link or ID"
        style={{
          width: "70%",
          maxWidth: "400px",
          padding: "10px",
          borderRadius: "12px",
          border: "none",
          textAlign: "center",
          fontSize: "1rem",
        }}
      />
      <button
        onClick={handleJoin}
        style={{
          marginTop: "20px",
          background: "white",
          color: "#764ba2",
          border: "none",
          borderRadius: "50px",
          padding: "12px 40px",
          fontWeight: "600",
        }}
      >
        Join
      </button>
    </div>
  );
}
