"use client";

import { useEffect } from "react";
import { ensureSeeded } from "@/lib/store";
import { pullAllFromCloud } from "@/lib/cloud";

// Chay 1 lan khi mo web: seed du lieu local roi keo du lieu tu Supabase ve.
// Khong render gi ca.
export default function CloudSync() {
  useEffect(() => {
    ensureSeeded();
    void pullAllFromCloud();
  }, []);
  return null;
}
