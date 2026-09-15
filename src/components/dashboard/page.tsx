import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents, canViewAdmin, hasPlayerLink } from "@/lib/auth/permissions";
import { DashboardTile } from "@/components/dashboard/tile";

export default async function DashboardPage() {
  // Real authorization check. middleware.ts/proxy.ts only avoids a UI
  // flash — this is what actually stops an unauthenticated request.
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user.profile.first_name || "there"}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {user.profile.role} · {user.groups.join(", ") || "No groups assigned"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardTile href="/dashboard/tickets" title="Tickets" description="Browse and access tickets" />
        <DashboardTile href="/dashboard/calendar" title="Calendar" description="Upcoming games and events" />
        <DashboardTile href="/donate" title="Donate" description="Support the program" />
        <DashboardTile href="/watch" title="Watch" description="Livestreams and broadcasts" />
        <DashboardTile href="/sponsors" title="Sponsors" description="Our partners" />
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
