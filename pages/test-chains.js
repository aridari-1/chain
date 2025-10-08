import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TestChains() {
  const [result, setResult] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult("❌ No session found. Please log in first.");
        return;
      }

      const res = await fetch("/api/chains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // ✅ send token
        },
        body: JSON.stringify({ test: true }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    })();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Test Chains API</h1>
      <pre className="bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}
