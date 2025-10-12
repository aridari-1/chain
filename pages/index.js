import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // ✅ Check login status
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
      }
      // logged in → stay here
    })();
  }, [router]);

  // Splash for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ✅ Share app link
  async function handleShare() {
    const shareText = "Join me on Chain 🌍🎤 — Say something the world will remember for 24h!";
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chain App",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("🔗 App link copied to clipboard!");
    }
  }

  // ✅ Splash Screen
  if (showSplash) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
          color: "white",
          fontFamily: "'Poppins', sans-serif",
          transition: "opacity 0.5s ease",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Image
          src="/chain-logo.png"
          alt="Chain Logo"
          width={90}
          height={90}
          style={{ borderRadius: "50%", marginBottom: "20px" }}
        />
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700 }}>Chain</h1>
        {/* ✅ Footer message during splash */}
        <p
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "0.9rem",
            opacity: 0.85,
          }}
        >
          Enjoy Chain.
        </p>
      </div>
    );
  }

  // ✅ Main Home Page
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        fontFamily: "'Poppins', sans-serif",
        padding: "20px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ✅ Logo + App name top-right */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          background: "rgba(255,255,255,0.15)",
          padding: "8px 12px",
          borderRadius: "40px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Image
          src="/chain-logo.png"
          alt="Chain Logo"
          width={30}
          height={30}
          style={{ borderRadius: "50%" }}
        />
        <span style={{ fontSize: "1rem", fontWeight: 600 }}>Chain ⌄</span>
      </div>

      {/* ✅ Dropdown menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            background: "rgba(255,255,255,0.95)",
            color: "#764ba2",
            borderRadius: "14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            padding: "10px 15px",
            textAlign: "left",
            width: "180px",
            zIndex: 10,
          }}
        >
          <p
            onClick={handleShare}
            style={{
              margin: 0,
              padding: "8px 0",
              cursor: "pointer",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              fontWeight: 500,
            }}
          >
            🔗 Share Chain
          </p>
          <p
            onClick={handleLogout}
            style={{
              margin: 0,
              padding: "8px 0",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            🚪 Log out
          </p>
        </div>
      )}

      {/* ✅ Center Button */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Link href="/global">
          <button
            style={{
              background: "white",
              color: "#764ba2",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "15px 40px",
              borderRadius: "40px",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.3s ease, background 0.3s ease",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            🌍 Enter Global Chain
          </button>
        </Link>
      </div>

      {/* ✅ Bottom Message */}
      <footer
        style={{
          fontSize: "1rem",
          opacity: 0.85,
          marginBottom: "20px",
          lineHeight: 1.4,
        }}
      >
        Say something the world will remember for 24h.
      </footer>

      {/* ✅ Mobile Responsive Polishing */}
      <style>{`
        @media (max-width: 600px) {
          h1 { font-size: 1.8rem !important; }
          p { font-size: 1rem !important; line-height: 1.4; }
          button {
            font-size: 1rem !important;
            padding: 12px 32px !important;
          }
          footer {
            font-size: 0.9rem !important;
            margin-bottom: 15px !important;
          }
          body, html {
            overflow-x: hidden !important;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
