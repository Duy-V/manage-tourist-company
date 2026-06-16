import QuoteForm from "./QuoteForm";

export default function NewQuotePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tạo báo giá</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Chọn một hành trình đã tạo, điền giá và thông tin khách — hệ thống tự tính tổng.
      </p>
      <QuoteForm />
    </main>
  );
}
