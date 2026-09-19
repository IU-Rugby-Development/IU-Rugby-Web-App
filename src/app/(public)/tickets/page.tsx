import { TICKET_STOREFRONT } from "@/lib/tickets/destination";

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ invalid?: string; unavailable?: string }> }) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">Be part of match day</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900">See you at the game.</h1>
      {params.invalid && <p role="status" className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">That referral link is unavailable. You can still browse tickets below.</p>}
      {params.unavailable && <p role="status" className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">Referral links are temporarily unavailable. You can still buy tickets directly at Kuntz.</p>}
      <p className="mt-6 text-lg leading-8 text-stone-600">Browse available IU Rugby events at the Kuntz Stadium ticket storefront. Ticket selection and payment are handled there through vivenu.</p>
      <a href={TICKET_STOREFRONT} className="mt-8 inline-flex rounded-md bg-[#790000] px-6 py-3 font-semibold text-white hover:bg-red-950">Buy tickets at Kuntz <span className="ml-3" aria-hidden="true">↗</span></a>
      <p className="mt-4 text-sm text-stone-500">You&apos;ll continue to the Kuntz Stadium website. Check each listing for the match, location, and ticket details.</p>
    </div>
  );
}
