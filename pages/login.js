import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Login() {
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    setUserAgent(ua);
    const isInApp = /(FBAN|FBAV|Instagram|Snapchat|TikTok|Twitter|Line)/i.test(ua);
    setInAppBrowser(isInApp);
  }, []);

  // ✅ Google login (works in normal browsers only)
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

  // ✅ Modal button actions
  const openInSafari = () => {
    window.location.href = window.location.href.replace(/^https?:\/\//, "http://");
    setTimeout(() => {
      alert("If it didn't open automatically, tap Share → Open in Safari.");
    }, 1000);
  };

  const openInChrome = () => {
    const url = window.location.href.replace(/^https?:\/\//, "");
    window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied! Paste it in Chrome or Safari.");
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
        position: "relative",
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

      {/* ✅ Popup modal for Snapchat / Instagram / TikTok */}
      {inAppBrowser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "18px",
              padding: "25px 22px",
              width: "90%",
              maxWidth: "380px",
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginBottom: "10px", fontSize: "1.4rem" }}>
              ⚠️ Open in Browser
            </h2>
            <p style={{ opacity: 0.9, marginBottom: "20px", fontSize: "1rem" }}>
              Google login isn’t supported inside this app.  
              Please open Chain in a secure browser to continue.
            </p>

            {/(iphone|ipad|ipod)/i.test(userAgent) ? (
              <button
                onClick={openInSafari}
                style={{
                  background: "#fff",
                  color: "#764ba2",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "10px",
                  width: "100%",
                }}
              >
                Open in Safari
              </button>
            ) : /(android)/i.test(userAgent) ? (
              <button
                onClick={openInChrome}
                style={{
                  background: "#fff",
                  color: "#764ba2",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "10px",
                  width: "100%",
                }}
              >
                Open in Chrome
              </button>
            ) : null}

            <button
              onClick={copyLink}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "10px 20px",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "30px",
                fontSize: "0.95rem",
                width: "100%",
              }}
            >
              Copy link instead
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
