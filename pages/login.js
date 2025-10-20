import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Login() {
  const [inAppBrowser, setInAppBrowser] = useState(false);

  // ✅ Detect if inside Snapchat, Instagram, TikTok, etc.
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = /(FBAN|FBAV|Instagram|Snapchat|TikTok|Twitter|Line)/i.test(ua);
    setInAppBrowser(isInApp);

    if (isInApp) {
      // ✅ Automatically try to open in Safari or Chrome
      const appUrl = window.location.href;

      if (/iphone|ipad|ipod/i.test(ua)) {
        // iOS → open in Safari directly
        window.location.href = `x-web-search://?${appUrl}`;
        setTimeout(() => {
          alert("Please tap the Share button → 'Open in Safari' to continue.");
        }, 1000);
      } else if (/android/i.test(ua)) {
        // Android → show the native browser chooser
        const intentUrl = `intent://${appUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;

        setTimeout(() => {
          alert("If not prompted, tap ⋮ → 'Open in Chrome' to continue.");
        }, 2000);
      } else {
        // Other devices fallback
        alert("Please open this link in Safari or Chrome to log in.");
      }
    }
  }, []);

  // ✅ Start Google sign-in normally when not in in-app browser
  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
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
       
      </p>

      {!inAppBrowser && (
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
