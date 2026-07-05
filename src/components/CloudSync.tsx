"use client";

import { useEffect } from "react";
import { ensureSeeded } from "@/lib/store";
import { pullAllFromCloud, migrateDataUrlImages } from "@/lib/cloud";

// Chay 1 lan khi mo web: seed du lieu local, keo du lieu tu Supabase ve,
// roi don dep anh base64 cu (tai len Storage, thay bang link). Khong render gi.
export default function CloudSync() {
  useEffect(() => {
    void (async () => {
      ensureSeeded();
      await pullAllFromCloud();
      await migrateDataUrlImages();
    })();
  }, []);
  return null;
}
