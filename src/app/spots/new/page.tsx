"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AutoForm from "@/components/AutoForm";
import { spotSchema } from "@/lib/schemas";
import { addSpot, getUserSpot, updateSpot, ensureSeeded } from "@/lib/store";
import { slugify } from "@/lib/slug";
import type { FormData } from "@/lib/schema";

function SpotFormPage() {
  const router = useRouter();
  const params = useSearchParams();
  const editSlug = params.get("edit");
  const editing = Boolean(editSlug);
  const [initial, setInitial] = useState<FormData | null>(editing ? null : {});

  useEffect(() => {
    ensureSeeded();
    if (!editSlug) return;
    const s = getUserSpot(editSlug);
    setInitial(s
      ? { name_vn: s.name_vn, name_cn: s.name_cn, city: s.city === "Khác" ? "" : s.city, description: s.description, image: s.image }
      : {});
  }, [editSlug]);

  function onSubmit(d: FormData) {
    const data = {
      name_vn: (d.name_vn || "").trim(),
      name_cn: (d.name_cn || "").trim() || undefined,
      city: (d.city || "").trim() || "Khác",
      description: (d.description || "").trim() || undefined,
      image: d.image,
    };
    if (!data.name_vn) return;
    if (editing && editSlug) updateSpot(editSlug, data);
    else addSpot({ slug: slugify(data.name_vn), ...data });
    router.push("/dashboard");
  }

  if (initial === null) {
    return <main className="mx-auto max-w-3xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:underline">← Cảnh điểm</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{editing ? "Sửa cảnh điểm" : "Thêm cảnh điểm"}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{editing ? "Cập nhật thông tin thẻ cảnh điểm." : "Tạo thẻ cảnh điểm mới để dùng khi dựng hành trình."}</p>
      <AutoForm
        schema={spotSchema}
        initial={initial}
        onSubmit={onSubmit}
        submitLabel={editing ? "Lưu thay đổi" : "Tạo thẻ cảnh điểm"}
        cancelHref="/dashboard"
      />
    </main>
  );
}

export default function NewSpotPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <SpotFormPage />
    </Suspense>
  );
}
