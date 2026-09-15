"use client";

import { useTransition } from "react";
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

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-4 text-sm text-gray-900">{name}</td>
      <td className="py-3 pr-4">
        <select
          defaultValue={role}
          disabled={isPending}
          onChange={(e) => {
            const fd = new FormData();
            fd.set("role", e.target.value);
            startTransition(() => setUserRole(userId, fd));
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
                onClick={() => {
                  const fd = new FormData();
                  fd.set("isMember", String(isMember));
                  startTransition(() => toggleUserGroup(userId, group.id, fd));
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
