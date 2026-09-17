import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlayerLink } from "@/lib/auth/permissions";
import { getOwnTicketLinkStats } from "@/lib/tickets/queries";
import { CopyLinkButton } from "@/components/tickets/copy-link-button";
import { getSiteUrl } from "@/lib/site-url";

export default async function MyTicketLinkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/tickets/my-link");

  if (!hasPlayerLink(user)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">My Ticket Link</h1>
        <p className="mt-2 text-sm text-gray-600">
          Referral links are available to players. If you should have one,
          contact an admin.
        </p>
      </div>
    );
  }

  const stats = await getOwnTicketLinkStats(user.id);
  const siteUrl = getSiteUrl();

  if (!stats) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">My Ticket Link</h1>
        <p className="mt-2 text-sm text-gray-600">
          You don&apos;t have a referral link yet. Ask an admin to create one
          for you.
        </p>
      </div>
    );
  }

  const fullUrl = `${siteUrl}/tickets/${stats.code}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">My Ticket Link</h1>
      {!stats.active && (
        <p className="mt-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Your link is currently deactivated by an admin.
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 p-4">
        <code className="flex-1 truncate text-sm text-gray-800">{fullUrl}</code>
        <CopyLinkButton url={fullUrl} />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-600">Referral Clicks</p>
        <p className="text-3xl font-bold text-gray-900">{stats.clicks}</p>
        <p className="mt-2 text-sm text-gray-600">Includes repeat visits and bots. Clicks do not measure ticket sales.</p>
      </div>
    </div>
  );
}
