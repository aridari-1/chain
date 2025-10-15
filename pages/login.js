import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Login() {
  const [inAppBrowser, setInAppBrowser] = useState(false);

  // ✅ Detect in-app browsers (Snapchat, Instagram, TikTok, Facebook, etc.)
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = /(FBAN|FBAV|Instagram|Snapchat|TikTok|Twitter|Line)/i.test(ua);
    setInAppBrowser(isInApp);
  }, []);

  // ✅ Start Google sign-in
  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`, // back to home after login
        },
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#667eea,#764ba2,#ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientMove 12s ease infinite",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <Image
        src="/chain-logo.png"
        alt="Chain Logo"
        width={80}
        height={80}
        style={{ borderRadius: "50%", marginBottom: "20px" }}
      />
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>Welcome to Chain</h1>
      <p style={{ opacity: 0.9, marginBottom: "30px" }}>
        Login with Google to join the global voice chain
      </p>

      {inAppBrowser ? (
        // ⚠️ Shown only inside Snapchat / Instagram / TikTok webviews
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            padding: "20px",
            borderRadius: "16px",
            maxWidth: "360px",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: "10px" }}>
            🚫 Google login isn’t supported in this browser.
          </p>
          <p style={{ fontSize: "0.95rem", opacity: 0.9 }}>
            Please tap the ⋯ menu and choose <strong>“Open in Chrome”</strong> or <strong>“Open in Safari”</strong> to continue.
          </p>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          style={{
            background: "#fff",
            color: "#764ba2",
            padding: "12px 22px",
            border: "none",
            borderRadius: "30px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Continue with Google
        </button>
      )}

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
