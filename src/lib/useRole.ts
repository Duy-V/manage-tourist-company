"use client";

// Vai tro + trang thai tai khoan lay tu bang profiles (Supabase):
// - role:   "admin" | "user" | "viewer" (khach vang lai / chua dang nhap)
// - status: "active" | "suspended" (admin tam ngung tai khoan)
// Admin va user DUNG CHUNG form dang nhap o /account — khong con
// login demo admin/admin123. Tai khoan bi tam ngung mat quyen admin
// va khong duoc viet danh gia (RLS chan ca o server).

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useUser } from "./useUser";

export type Role = "admin" | "user" | "viewer";
export type AccountStatus = "active" | "suspended";
export interface ProfileInfo {
  role: Role;
  status: AccountStatus;
}

const GUEST: ProfileInfo = { role: "viewer", status: "active" };

// Cache theo user de nhieu component goi hook khong query lap lai
let cached: { uid: string; info: ProfileInfo } | null = null;

export function useProfileInfo(): ProfileInfo {
  const { user } = useUser();
  const [info, setInfo] = useState<ProfileInfo>(() =>
    user && cached?.uid === user.id ? cached.info : GUEST
  );

  useEffect(() => {
    if (!user || !supabase) {
      setInfo(GUEST);
      return;
    }
    if (cached?.uid === user.id) {
      setInfo(cached.info);
      return;
    }
    let alive = true;
    supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const next: ProfileInfo = {
          role: data?.role === "admin" ? "admin" : "user",
          status: data?.status === "suspended" ? "suspended" : "active",
        };
        cached = { uid: user.id, info: next };
        if (alive) setInfo(next);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return info;
}

export function useRole(): Role {
  const { role, status } = useProfileInfo();
  // Bi tam ngung -> mat quyen quan tri (con dang nhap thi van la "user")
  return status === "suspended" && role === "admin" ? "user" : role;
}
