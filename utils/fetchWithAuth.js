// utils/fetchWithAuth.js
import { supabase } from "../lib/supabaseClient";

/**
 * Use this instead of fetch() for any API call that requires auth.
 * It automatically adds: Authorization: Bearer <access_token>
 */
export async function fetchWithAuth(url, options = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error("Failed to read session: " + error.message);
  }
  if (!session?.access_token) {
    throw new Error("No access token available. Please log in.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${session.access_token}`,
  };

  return fetch(url, { ...options, headers });
}
