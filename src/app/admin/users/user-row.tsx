"use client";

import { useState, useTransition } from "react";
import { setUserRole, toggleUserGroup } from "../actions";
import { ROLES, type GroupName, type Role } from "@/types/domain";

interface UserRowProps {
  userId: string;
  name: string;
  role: Role;
  allGroups: { id: string; name: GroupName }[];
  memberGroupIds: Set<string>;
}

export function UserRow({ userId, name, role, allGroups, memberGroupIds }: UserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-4 text-sm text-gray-900">{name}{error && <p role="alert" className="text-sm text-red-800">{error}</p>}</td>
      <td className="py-3 pr-4">
        <select
          value={role}
          aria-label={`Role for ${name}`}
          disabled={isPending}
          onChange={(e) => {
            const fd = new FormData();
            fd.set("role", e.target.value);
            startTransition(async () => { const result = await setUserRole(userId, fd); setError(result.error); });
          }}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-2">
          {allGroups.map((group) => {
            const isMember = memberGroupIds.has(group.id);
            return (
              <button
                key={group.id}
                type="button"
                disabled={isPending}
                aria-pressed={isMember}
                aria-label={`${group.name} membership for ${name}`}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("isMember", String(isMember));
                  startTransition(async () => { const result = await toggleUserGroup(userId, group.id, fd); setError(result.error); });
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isMember
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>
      </td>
    </tr>
  );
}
