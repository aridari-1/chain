// pages/admin/stats.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // ✅ Restrict access (replace with your own admin email)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== "proposalcampaign@gmail.com") {
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from("daily_stats")
        .select("*")
        .order("day", { ascending: false })
        .limit(30); // last 30 days

      if (error) console.error("❌ Failed to load stats:", error);
      else setStats(data || []);
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
        fontFamily: "Poppins, sans-serif",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "25px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "25px" }}>
          📊 Daily Engagement Stats
        </h1>

        {stats.length === 0 ? (
          <p style={{ textAlign: "center" }}>No stats available yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
              textAlign: "center",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.2)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={thStyle}>📅 Day</th>
                <th style={thStyle}>👥 Unique Users</th>
                <th style={thStyle}>🎙️ Total Clips</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background:
                      i % 2 === 0
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.05)",
                  }}
                >
                  <td style={tdStyle}>{row.day}</td>
                  <td style={tdStyle}>{row.unique_users}</td>
                  <td style={tdStyle}>{row.total_clips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer
        style={{
          textAlign: "center",
          marginTop: "40px",
          opacity: 0.8,
          fontSize: "0.9rem",
        }}
      >
        Voice Chain Admin Dashboard
      </footer>
    </div>
  );
}

const thStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
};

const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.15)",
  fontSize: "1rem",
};
