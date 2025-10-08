// pages/index.js
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        // 🎬 Splash Screen
        <motion.div
          key="splash"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1 }}
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
          }}
        >
          <Image
            src="/chain-logo.png"
            alt="Voice Chain Logo"
            width={140}
            height={140}
            style={{
              filter: "drop-shadow(0px 0px 14px rgba(255,255,255,0.7))",
              borderRadius: "50%",
            }}
          />
        </motion.div>
      ) : (
        // 🌈 Main Interface (simplified)
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Button Glow Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 50% 120%, rgba(255,255,255,0.15), transparent 70%)",
              animation: "pulseBG 6s ease-in-out infinite",
              zIndex: 0,
            }}
          />

          {/* Vibrant Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              zIndex: 2,
              marginBottom: "80px",
            }}
          >
            <Link href="/friends">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: "linear-gradient(90deg, #ffb6ff, #b344ff, #667eea)",
                  backgroundSize: "300% 300%",
                  animation: "moveGradient 4s ease infinite",
                  border: "none",
                  color: "white",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  padding: "18px 50px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                }}
              >
                🤝 Friends
              </motion.button>
            </Link>

            <Link href="/global">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: "linear-gradient(90deg, #ff9a9e, #fad0c4, #a1c4fd)",
                  backgroundSize: "300% 300%",
                  animation: "moveGradient 4s ease infinite",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  padding: "18px 50px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                }}
              >
                🌍 Global
              </motion.button>
            </Link>
          </div>

          {/* Footer */}
          <footer
            style={{
              position: "absolute",
              bottom: "25px",
              fontSize: "0.9rem",
              opacity: 0.85,
              zIndex: 2,
            }}
          >
            Made with ❤️ by Chain
          </footer>

          <style>{`
            @keyframes moveGradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            @keyframes pulseBG {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
