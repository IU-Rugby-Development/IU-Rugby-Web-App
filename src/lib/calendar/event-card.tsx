import type { EventRow } from "@/types/domain";

const typeColors: Record<EventRow["event_type"], string> = {
  GAME: "bg-red-100 text-red-800",
  PRACTICE: "bg-blue-100 text-blue-800",
  EVENT: "bg-purple-100 text-purple-800",
  FUNDRAISER: "bg-green-100 text-green-800",
  MEETING: "bg-gray-100 text-gray-800",
  OTHER: "bg-yellow-100 text-yellow-800",
};

export function EventCard({ event }: { event: EventRow }) {
  const start = new Date(event.starts_at);

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${typeColors[event.event_type]}`}
          >
            {event.event_type}
          </span>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {start.toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        {event.description && (
          <p className="mt-1 text-sm text-gray-500">{event.description}</p>
        )}
      </div>
      
        href={`/calendar/${event.id}/ics`}
        className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        download
      >
        Add to Calendar
      </a>
    </li>
  );
}
