import { redirect } from "next/navigation";

// Da gop "Hanh trinh" vao trang "Tour & Hanh trinh" (/tours)
export default function ItinerariesPage() {
  redirect("/tours");
}
