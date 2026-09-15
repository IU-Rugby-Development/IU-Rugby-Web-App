import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPlayerLink } from "@/lib/auth/permissions";
import { getLeaderboard } from "@/lib/tickets/queries";

export default async function DashboardTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/tickets");

  const leaderboard = await getLeaderboard();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>

      {hasPlayerLink(user) && (
        <Link
          href="/dashboard/tickets/my-link"
          className="mt-2 inline-block text-sm font-medium text-red-700 hover:underline"
        >
          View my ticket link →
        </Link>
      )}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-gray-900">
        Top Ticket Promoters
      </h2>
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
    </div>
  );
}
