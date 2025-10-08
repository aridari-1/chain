// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  // If not logged in, redirect to /login
  if (!session && typeof window !== 'undefined') {
    window.location.href = '/login';
    return null;
  }

  // Logged in → show main app
  return <Component {...pageProps} />;
}
