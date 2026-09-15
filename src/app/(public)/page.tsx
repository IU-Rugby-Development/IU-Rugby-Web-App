import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        IU Men&apos;s Rugby
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Home of Indiana University Men&apos;s Rugby and Friends of Hoosier
        Rugby &mdash; schedules, tickets, and everything to support the team.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/calendar">
          <Button>View Schedule</Button>
        </Link>
        <Link href="/tickets">
          <Button variant="secondary">Get Tickets</Button>
        </Link>
      </div>
    </div>
  );
}
