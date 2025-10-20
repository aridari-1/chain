import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Login() {
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Detect if user is inside Snapchat, Instagram, TikTok, etc.
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = /(FBAN|FBAV|Instagram|Snapchat|TikTok|Twitter|Line)/i.test(ua);
    setInAppBrowser(isInApp);

    if (isInApp) {
      const appUrl = window.location.href;

      if (/iphone|ipad|ipod/i.test(ua)) {
        // iOS → Try to open Safari directly
        window.location.href = `x-web-search://?${appUrl}`;
      } else if (/android/i.test(ua)) {
        // Android → Try to open Chrome directly
        const intentUrl = `intent://${appUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
      }

      // ⏳ If automatic redirect doesn’t work within 2s, show the popup
      setTimeout(() => {
        setShowPopup(true);
      }, 2000);
    }
  }, []);

  // ✅ Start Google sign-in normally (outside in-app browsers)
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

  // ✅ Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("✅ Link copied! Open Safari or Chrome and paste it to continue.");
    } catch {
      alert("Copy failed. Please copy the URL manually.");
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

      {/* ⚠️ Popup for in-app browsers */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "#333",
              padding: "25px",
              borderRadius: "16px",
              textAlign: "center",
              width: "90%",
              maxWidth: "360px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ marginBottom: "10px", color: "#764ba2" }}>Open in Browser</h2>
            <p style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              Google login doesn’t work inside Snapchat or Instagram.  
              Please open this page in <strong>Safari</strong> or <strong>Chrome</strong>.
            </p>
            <button
              onClick={copyLink}
              style={{
                background: "#764ba2",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                padding: "10px 20px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Copy Link
            </button>
          </div>
        </div>
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
