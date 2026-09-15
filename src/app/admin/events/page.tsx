import { redirect } from "next/navigation";

export default function AdminEventsPage() {
  // Event management already lives at /dashboard/calendar/manage and is
  // shared between EXECUTIVE and ADMIN — no need for a second copy.
  redirect("/dashboard/calendar/manage");
}
