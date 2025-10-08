import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Callback() {
  const [msg, setMsg] = useState("Restoring session...");

  useEffect(() => {
    (async () => {
      try {
        const url = window.location.href;

        // If the provider sent an error, catch it
        const params = new URL(url).searchParams;
        const err = params.get("error_description");
        if (err) {
          setMsg("Auth error: " + decodeURIComponent(err));
          return;
        }

        // ✅ Supabase v2: Exchange the code for a session and store it
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) throw error;

        setMsg("Signed in. Redirecting…");
        setTimeout(() => window.location.replace("/"), 500);
      } catch (e) {
        console.error("Auth callback error:", e);
        setMsg("Auth error: " + e.message);
      }
    })();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <p className="text-gray-700">{msg}</p>
    </div>
  );
}
