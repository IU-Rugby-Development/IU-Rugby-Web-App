import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";

const adminLinks = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/groups", label: "Groups" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/tickets", label: "Ticket Links" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin");
  // The real backstop is RLS (profiles_update_admin, group_memberships_write_admin,
  // ticket_links_write_admin, etc.) — this check just keeps non-admins off
  // the page entirely instead of showing them a broken screen.
  if (!isAdmin(user)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
      <nav className="mt-4 flex gap-4 border-b border-gray-200 pb-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 hover:text-red-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
