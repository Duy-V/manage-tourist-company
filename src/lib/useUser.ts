"use client";

// Tai khoan nguoi dung THAT (Supabase Auth) — admin va user dung chung.
// Dang ky bang email + mat khau, Supabase gui email xac thuc,
// bam link xong moi dang nhap duoc. Phien dang nhap luu trong localStorage
// va tu phat hien khi quay ve tu link xac thuc (detectSessionInUrl).

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function displayNameOf(user: User): string {
  return (
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Người dùng"
  );
}
