import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Create Supabase client using service role key (server-side access only)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

// ✅ Public cleanup function — no Authorization header required
Deno.serve(async (_req) => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log(`🧹 Running cleanup for clips older than ${cutoff}`);

  // Delete all clips older than 24 hours
  const { error } = await supabase
    .from("clips")
    .delete()
    .lt("created_at", cutoff);

  if (error) {
    console.error("❌ Cleanup error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Cleanup failed", error }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  console.log("✅ Old clips cleaned up successfully.");
  return new Response(
    JSON.stringify({
      success: true,
      message: "Old clips cleaned up successfully.",
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});
