"use client";

import { useState } from "react";
import { addQuoteRequest, type QuoteRequest } from "@/lib/store";
import { pushRequestCloud } from "@/lib/cloud";
import { slugify } from "@/lib/slug";

const inputCls =
  "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
const labelCls = "text-xs font-medium text-[var(--text-muted)]";

export default function QuoteRequestForm({
  tourCode,
  tourName,
  cover,
}: {
  tourCode: string;
  tourName: string;
  cover?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && adults + children + infants > 0;

  async function submit() {
    if (!canSubmit) {
      setError("Vui lòng điền họ tên, số điện thoại và số khách.");
      return;
    }
    setError("");
    const req: QuoteRequest = {
      id: slugify(name) + "-" + Date.now().toString(36),
      tourCode,
      tourName,
      cover,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      departureDate: departureDate || undefined,
      adults,
      children,
      infants,
      note: note.trim() || undefined,
      status: "new",
      createdAt: Date.now(),
    };
    setSending(true);
    addQuoteRequest(req);                    // luu tren may
    const ok = await pushRequestCloud(req);  // gui len Supabase (neu da cau hinh)
    setSending(false);
    if (!ok) {
      setError("Gửi chưa thành công (mất kết nối máy chủ). Vui lòng bấm gửi lại hoặc liên hệ trực tiếp.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <section id="yeu-cau-bao-gia" className="mt-10 rounded-2xl border bg-white p-8 text-center">
        <div className="text-3xl">✅</div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Đã gửi yêu cầu báo giá!</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Cảm ơn <b>{name}</b>. Chúng tôi sẽ liên hệ qua số <b>{phone}</b> trong thời gian sớm nhất.
        </p>
        <button
          onClick={() => { setSent(false); setName(""); setPhone(""); setEmail(""); setNote(""); }}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          Gửi yêu cầu khác
        </button>
      </section>
    );
  }

  return (
    <section id="yeu-cau-bao-gia" className="mt-10 rounded-2xl border bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight">Nhận báo giá tour này</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Để lại thông tin, chúng tôi sẽ gửi báo giá chi tiết cho <b>{tourName}</b>.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Họ tên *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nguyễn Văn A" />
        </label>
        <label className="block">
          <span className={labelCls}>Số điện thoại *</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="09xx xxx xxx" inputMode="tel" />
        </label>
        <label className="block">
          <span className={labelCls}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="ban@email.com" inputMode="email" />
        </label>
        <label className="block">
          <span className={labelCls}>Ngày khởi hành mong muốn</span>
          <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <NumField label="Người lớn" value={adults} setValue={setAdults} />
        <NumField label="Trẻ 2–11" value={children} setValue={setChildren} />
        <NumField label="Dưới 2 tuổi" value={infants} setValue={setInfants} />
      </div>

      <label className="mt-4 block">
        <span className={labelCls}>Ghi chú</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={inputCls}
          placeholder="Yêu cầu riêng: khách sạn, ăn uống, đoàn riêng…" />
      </label>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        onClick={() => void submit()}
        disabled={sending}
        className="mt-5 w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {sending ? "Đang gửi…" : "Gửi yêu cầu báo giá"}
      </button>
    </section>
  );
}

function NumField({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input type="number" min={0} value={value}
        onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
        className={inputCls} />
    </label>
  );
}
