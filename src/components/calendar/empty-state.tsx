export function CalendarEmptyState() {
  return <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
    <svg aria-hidden="true" className="mx-auto mb-4 h-9 w-9 text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6M17 2v6M3 11h18M8 15h3M8 18h7"/></svg>
    <h2 className="font-semibold text-gray-900">No upcoming events yet</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">New events will appear here when they’re added to the calendar. Check back for the next club gathering.</p>
  </div>;
}
