import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents, canViewAdmin, hasPlayerLink } from "@/lib/auth/permissions";
import { DashboardTile } from "@/components/dashboard/tile";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  // Real authorization check. middleware.ts/proxy.ts only avoids a UI
  // flash — this is what actually stops an unauthenticated request.
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard");
  const { confirmed } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {confirmed === "1" && <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">Your email is confirmed. You’re signed in and ready to use IU Rugby.</p>}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">IU Rugby · Dashboard</p>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user.profile.first_name || "there"}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {user.profile.role} · {user.groups.join(", ") || "No groups assigned"}
      </p>
      {user.groups.length === 0 && <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">Your account is ready. An administrator can assign your stakeholder groups to give you access to the relevant club events and player tools.</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardTile href="/dashboard/tickets" title="Tickets" description="Browse and access tickets" />
        <DashboardTile href="/dashboard/calendar" title="Calendar" description="Upcoming games and events" />
        <DashboardTile href="/dashboard/profile" title="Profile" description="Edit your account details" />

        {hasPlayerLink(user) && (
          <DashboardTile
            href="/dashboard/tickets/my-link"
            title="My Ticket Link"
            description="Your personal referral link and stats"
          />
        )}

        {canManageEvents(user) && (
          <DashboardTile
            href="/dashboard/calendar/manage"
            title="Manage Events"
            description="Create, edit, and remove events"
          />
        )}

        {canViewAdmin(user) && (
          <DashboardTile href="/admin" title="Admin" description="Manage users, groups, and roles" />
        )}
      </div>
    </div>
  );
}
