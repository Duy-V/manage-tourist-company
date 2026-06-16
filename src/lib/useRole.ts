"use client";
import { useEffect, useState } from "react";
import { getRole, type Role } from "./auth";

export function useRole(): Role {
  const [role, setRole] = useState<Role>("viewer");
  useEffect(() => {
    const sync = () => setRole(getRole());
    sync();
    window.addEventListener("tq-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tq-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return role;
}
