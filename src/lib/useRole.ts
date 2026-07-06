"use client";

// Vai tro nguoi dung lay tu cot `role` trong bang profiles (Supabase):
// - "admin"  : quan tri (duoc cap bang cach sua role trong Dashboard)
// - "user"   : tai khoan thuong da dang nhap
// - "viewer" : khach vang lai / chua dang nhap
// Admin va user DUNG CHUNG form dang nhap o /account — khong con
// login demo admin/admin123 (da bo tq_role).

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useUser } from "./useUser";

export type Role = "admin" | "user" | "viewer";

// Cache theo user de nhieu component goi useRole khong query lap lai
let cached: { uid: string; role: Role } | null = null;

export function useRole(): Role {
  const { user } = useUser();
  const [role, setRole] = useState<Role>(() =>
    user && cached?.uid === user.id ? cached.role : "viewer"
  );

  useEffect(() => {
    if (!user || !supabase) {
      setRole("viewer");
      return;
    }
    if (cached?.uid === user.id) {
      setRole(cached.role);
      return;
    }
    let alive = true;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const r: Role = data?.role === "admin" ? "admin" : "user";
        cached = { uid: user.id, role: r };
        if (alive) setRole(r);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return role;
}
