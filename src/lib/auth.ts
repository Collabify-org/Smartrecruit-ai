import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User as SupaUser } from "@supabase/supabase-js";

export type User = { email: string; name: string };

function toUser(u: SupaUser | null | undefined): User | null {
  if (!u) return null;
  return { email: u.email || "", name: (u.email || "user").split("@")[0] };
}

let cachedSession: Session | null = null;
supabase.auth.getSession().then(({ data }) => { cachedSession = data.session; });
supabase.auth.onAuthStateChange((_e, s) => { cachedSession = s; });

export function isAuthed() {
  return !!cachedSession;
}

export function getUser(): User | null {
  return toUser(cachedSession?.user);
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [loading, setLoading] = useState(cachedSession === null);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, user: toUser(session?.user), loading };
}
