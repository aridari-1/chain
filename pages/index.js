import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // --- Auth State Hooks ---
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Splash State Hooks ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Auth Check ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) router.replace("/login");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // --- Splash Timer ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;
  if (!session) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center" }}
          >
            <Image
              src="/chain-logo.png"
              alt="Voice Chain Logo"
              width={100}
              height={100}
              style={{ borderRadius: "50%" }}
            />
            <h1 style={{ color: "white", marginTop: 12, fontSize: "1.8rem" }}>
              Voice Chain
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <Link href="/friends">
              <button
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid white",
                  borderRadius: "50px",
                  color: "white",
                  fontSize: "1.2rem",
                  padding: "15px 50px",
                  fontWeight: "600",
                  backdropFilter: "blur(8px)",
                }}
              >
                👬 Friends
              </button>
            </Link>

            <Link href="/global">
              <button
                style={{
                  background: "white",
                  color: "#764ba2",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "1.2rem",
                  padding: "15px 50px",
                  fontWeight: "600",
                }}
              >
                🌍 Global
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        style={{
          position: "absolute",
          bottom: "20px",
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.9rem",
          letterSpacing: "0.5px",
        }}
      >
        Enjoy Chain
      </footer>
    </div>
  );
}
