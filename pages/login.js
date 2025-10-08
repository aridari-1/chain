import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  // ✅ Capture tokens from the URL hash after redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({
            access_token,
            refresh_token,
          })
          .then(({ data, error }) => {
            if (error) {
              console.error("Auth error:", error);
            } else {
              console.log("✅ Session stored:", data);
              router.push("/"); // redirect to home
            }
          });
      }
    }
  }, [router]);

  // ✅ Google login with explicit redirectTo
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/login", // force return here
      },
    });
    if (error) console.error("Google login error:", error.message);
  }

  // ✅ Email login with magic link
  async function signInWithEmail() {
    const email = prompt("Enter your email:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        redirectTo: "http://localhost:3000/login", // also return here
      },
    });
    if (error) {
      console.error("Email login error:", error.message);
    } else {
      alert("✅ Check your inbox for the magic link!");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-red-600 text-white rounded shadow"
      >
        Sign in with Google
      </button>

      <button
        onClick={signInWithEmail}
        className="px-6 py-3 bg-blue-600 text-white rounded shadow"
      >
        Sign in with Email
      </button>
    </div>
  );
}
