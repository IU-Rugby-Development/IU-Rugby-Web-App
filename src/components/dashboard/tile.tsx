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
      className="flex flex-col gap-1 rounded-lg border border-gray-200 p-4 transition-colors hover:border-red-700 hover:bg-red-50"
    >
      <span className="font-semibold text-gray-900">{title}</span>
      <span className="text-sm text-gray-600">{description}</span>
    </Link>
  );
}
