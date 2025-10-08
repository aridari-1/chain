// pages/login.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Check session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/"); // already logged in → go to main interface
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/"); // redirect to main screen
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2, #ff6ec4)",
        backgroundSize: "300% 300%",
        animation: "gradientBG 12s ease infinite",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: "white", fontSize: "1.8rem", marginBottom: "20px" }}>
        🎤 Voice Chain Login
      </h1>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          padding: "30px",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <Auth
          supabaseClient={supabase}
          providers={["google"]}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </div>
    </div>
  );
}
