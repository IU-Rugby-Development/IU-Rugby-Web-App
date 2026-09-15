export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
      {params.invalid && (
        <p className="mt-4 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          That referral link isn&apos;t valid or is no longer active, but you
          can still get tickets below.
        </p>
      )}
      <p className="mt-4 text-gray-600">
        Ticket sales are handled through our external ticketing provider.
        Check back closer to game day, or use a player&apos;s referral link
        to support them directly.
      </p>
    </div>
  );
}
