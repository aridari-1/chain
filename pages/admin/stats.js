// pages/admin/stats.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // ✅ Restrict access by email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== "proposalcampaign@gmail.com") {
        // Replace with your own email used in Supabase auth
        window.location.href = "/";
        return;
      }

      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h2>Loading dashboard...</h2>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "25px" }}>📊 Voice Chain Usage</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <StatCard label="Users" value={stats.users} emoji="👤" />
        <StatCard label="Chains" value={stats.chains} emoji="🔗" />
        <StatCard label="Clips" value={stats.clips} emoji="🎤" />
        <StatCard label="Storage" value={`${stats.estimatedStorageMB} MB`} emoji="💾" />
      </div>

      <footer style={{ marginTop: "30px", opacity: 0.8, fontSize: "0.9rem" }}>
        Voice Chain Admin Dashboard
      </footer>
    </div>
  );
}

function StatCard({ label, value, emoji }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        borderRadius: 15,
        padding: "20px 10px",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontSize: "2rem" }}>{emoji}</div>
      <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", marginTop: "8px", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
