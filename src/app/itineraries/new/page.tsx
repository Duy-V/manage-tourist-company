import { redirect } from "next/navigation";

// "Hành trình" đã gộp vào Tour — chuyển hướng sang trình tạo Tour.
export default async function NewItineraryRedirect({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  redirect(edit ? `/tour/new?edit=${encodeURIComponent(edit)}` : "/tour/new");
}
