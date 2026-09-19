import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[#790000] text-white">
        <div className="field-lines pointer-events-none absolute inset-y-10 right-[-5rem] hidden w-[42%] rotate-12 opacity-15 lg:block" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-100">Indiana University · Men&apos;s Rugby</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">For the team.<br />For the Hoosiers.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-red-50">Follow the schedule, be there on match day, and stay connected to IU Rugby.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/calendar" className="rounded-md bg-white px-6 py-3 font-bold text-[#790000] hover:bg-red-50">View schedule <span aria-hidden="true">→</span></Link>
            <Link href="/tickets" className="rounded-md border border-white/60 px-6 py-3 font-bold hover:bg-white/10">Buy tickets</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20" aria-labelledby="connected-heading">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">Friends of Hoosier Rugby</p>
        <h2 id="connected-heading" className="mt-3 text-3xl font-bold tracking-tight text-stone-900">Your connection to the club.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { href: "/calendar", number: "01", title: "Find your next match", text: "Upcoming games and club events, with calendar downloads to keep you in the loop.", action: "Explore the schedule" },
            { href: "/tickets", number: "02", title: "Be there on match day", text: "Find available tickets through the Kuntz Stadium ticket storefront.", action: "Find tickets" },
            { href: "/login", number: "03", title: "Stay connected", text: "Sign in for your club calendar, account details, and the tools available to you.", action: "Sign in to your account" },
          ].map((item) => (
            <article key={item.href} className="flex flex-col rounded-lg border border-stone-200 bg-white p-6">
              <span className="text-sm font-semibold text-red-800" aria-hidden="true">{item.number}</span>
              <h3 className="mt-5 text-xl font-bold text-stone-900">{item.title}</h3>
              <p className="mb-7 mt-3 flex-1 text-sm leading-6 text-stone-600">{item.text}</p>
              <Link href={item.href} className="text-sm font-semibold text-red-800 underline decoration-red-200 underline-offset-4 hover:decoration-red-800">{item.action} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
