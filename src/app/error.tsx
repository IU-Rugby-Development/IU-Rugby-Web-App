"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-2xl px-5 py-16">
    <h1 className="text-2xl font-bold">This page is temporarily unavailable.</h1>
    <p className="mt-3 text-gray-600">Please try again. If this continues, contact a club administrator.</p>
    <button onClick={reset} className="mt-6 rounded-md bg-red-800 px-5 py-2 text-white">Try again</button>
  </div>;
}
