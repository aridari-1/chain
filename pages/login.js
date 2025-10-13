// pages/login.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/global"); // ✅ redirect to global after login
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/global"); // ✅ redirect to global after login
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
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ color: "white", fontSize: "2.2rem", marginBottom: "20px" }}>
         Chain
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "25px" }}>
       
      </p>

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
          providers={["google"]} // ✅ Google-only login
          appearance={{
            theme: ThemeSupa,
            style: {
              button: { background: "white", color: "#764ba2" },
            },
          }}
          theme="dark"
          onlyThirdPartyProviders={true} // ✅ hides email fields
        />
      </div>
    </div>
  );
}
