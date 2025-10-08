import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Debug() {
  const [info, setInfo] = useState("Checking session...");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setInfo(
          `✅ Logged in\n\nUser ID: ${data.session.user.id}\nToken: ${data.session.access_token.substring(
            0,
            30
          )}...`
        );
      } else {
        setInfo("❌ No session found. You are not logged in.");
      }
    })();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6 whitespace-pre-line text-gray-800">
      <h1 className="text-xl font-bold mb-4">Debug Session</h1>
      <p>{info}</p>
    </div>
  );
}
