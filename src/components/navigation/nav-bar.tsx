import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin, isExecutive } from "@/lib/auth/permissions";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export async function NavBar() {
  const user = await getCurrentUser();
  const linkStyle = "rounded-sm py-2 text-sm font-semibold text-stone-700 hover:text-red-800";
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
        <Link href="/" className="text-xl font-black tracking-tight text-[#790000]">IU RUGBY<span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Friends of Hoosier Rugby</span></Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href="/calendar" className={linkStyle}>Schedule</Link>
          <Link href="/tickets" className={linkStyle}>Tickets</Link>
          {user ? <>
            <Link href="/dashboard" className={linkStyle}>Dashboard</Link>
            {isExecutive(user) && <Link href="/dashboard/calendar/manage" className={linkStyle}>Manage events</Link>}
            {isAdmin(user) && <Link href="/admin" className={linkStyle}>Admin</Link>}
            <form action={signOut}><Button variant="secondary" type="submit">Sign out</Button></form>
          </> : <>
            <Link href="/login" className={linkStyle}>Sign in</Link>
            <Link href="/signup" className="rounded-md bg-[#790000] px-4 py-2 text-sm font-semibold text-white hover:bg-red-950">Join us</Link>
          </>}
        </div>
      </nav>
    </header>
  );
}
