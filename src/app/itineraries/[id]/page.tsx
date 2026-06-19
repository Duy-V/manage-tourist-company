import { redirect } from "next/navigation";

// "Hành trình" đã gộp vào Tour — id cũ giờ là code của Tour.
export default async function ItineraryDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/tours/${encodeURIComponent(id)}`);
}
