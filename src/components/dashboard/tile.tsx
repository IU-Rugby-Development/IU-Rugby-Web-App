import Link from "next/link";

export function DashboardTile({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-red-700 hover:bg-red-50"
    >
      <span className="flex items-center justify-between font-semibold text-gray-900">{title}<span aria-hidden="true" className="text-red-800">↗</span></span>
      <span className="text-sm text-gray-600">{description}</span>
    </Link>
  );
}
