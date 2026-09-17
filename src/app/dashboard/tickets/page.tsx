import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlayerLink, canViewReferralAnalytics } from "@/lib/auth/permissions";
import { TICKET_STOREFRONT } from "@/lib/tickets/destination";
import { getLeaderboard } from "@/lib/tickets/queries";

export default async function DashboardTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/tickets");

  const canViewAnalytics = canViewReferralAnalytics(user);
  const leaderboard = canViewAnalytics ? await getLeaderboard() : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
      <p className="mt-3 text-gray-600">Find available tickets through Kuntz Stadium.</p>
      <a href={TICKET_STOREFRONT} className="mt-4 inline-block rounded-md bg-red-800 px-5 py-2 font-semibold text-white">Buy tickets at Kuntz ↗</a>

      {hasPlayerLink(user) && (
        <Link
          href="/dashboard/tickets/my-link"
          className="mt-2 inline-block text-sm font-medium text-red-700 hover:underline"
        >
          View my ticket link →
        </Link>
      )}

      {canViewAnalytics && <section>
      <h2 className="mt-8 mb-3 text-lg font-semibold text-gray-900">
        Referral traffic
      </h2>
      <p className="mb-4 text-sm text-gray-600">Ticket-link clicks, including repeat visits and bots. These are not unique visitors, purchases, or revenue.</p>
      {leaderboard.length === 0 ? (
        <p className="text-sm text-gray-600">No referral activity yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {leaderboard.map((entry, i) => (
            <li
              key={entry.playerId}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <span className="text-sm text-gray-900">
                <span className="mr-2 font-semibold text-red-700">{i + 1}.</span>
                {entry.name || "Player"}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {entry.referralClicks} referral clicks
              </span>
            </li>
          ))}
        </ol>
      )}
      </section>}
    </div>
  );
}
