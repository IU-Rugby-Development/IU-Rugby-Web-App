import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin, isExecutive } from "@/lib/auth/permissions";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const publicLinks = [
  { href: "/calendar", label: "Calendar" },
  { href: "/tickets", label: "Tickets" },
  { href: "/donate", label: "Donate" },
  { href: "/watch", label: "Watch" },
  { href: "/sponsors", label: "Sponsors" },
];

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-red-700">
          IU Rugby
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-red-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-red-700"
              >
                Dashboard
              </Link>
              {isExecutive(user) && (
                <Link
                  href="/dashboard/calendar"
                  className="hidden text-sm font-medium text-gray-700 hover:text-red-700 sm:inline"
                >
                  Manage Events
                </Link>
              )}
              {isAdmin(user) && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-700 hover:text-red-700"
                >
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <Button variant="secondary" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-red-700"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
