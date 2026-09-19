"use client";

import { useState, useTransition } from "react";
import { setUserRole, toggleUserGroup } from "../actions";
import { ROLES, type GroupName, type Role } from "@/types/domain";

interface UserRowProps {
  userId: string;
  name: string;
  email: string;
  isSelf: boolean;
  role: Role;
  allGroups: { id: string; name: GroupName }[];
  memberGroupIds: Set<string>;
}

export function UserRow({ userId, name, email, isSelf, role, allGroups, memberGroupIds }: UserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState(role);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  return <li className="rounded-xl border border-gray-200 bg-white p-5">
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900">{name}{isSelf && <span className="ml-2 text-xs font-normal text-gray-500">Your account</span>}</h3>
        <p className="mt-1 break-words text-sm text-gray-600">{email}</p>
        <p className="mt-2 text-xs font-medium text-gray-500">Current role: {role}</p>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(); fd.set("role", selectedRole); fd.set("expectedRole", role);
        startTransition(async () => { const result = await setUserRole(userId, fd); setError(result.error); setSaved(!result.error); });
      }}>
        <label htmlFor={`role-${userId}`} className="mb-2 block text-xs font-semibold text-gray-600">Access role</label>
        <div className="flex flex-wrap gap-2">
          <select id={`role-${userId}`} aria-label={`Role for ${name}`} value={selectedRole} disabled={isPending || isSelf}
            onChange={(e) => { setSelectedRole(e.target.value as Role); setSaved(false); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {!isSelf && <button type="submit" disabled={isPending || selectedRole === role} className="rounded-lg bg-red-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Save role</button>}
        </div>
        {isSelf && <p className="mt-2 max-w-56 text-xs text-gray-500">Another admin can change your role.</p>}
      </form>
    </div>
    <div className="mt-5 border-t border-gray-100 pt-4">
      <p className="mb-2 text-xs font-semibold text-gray-600">Stakeholder groups</p>
      <div className="flex flex-wrap gap-2">{allGroups.map((group) => {
        const isMember = memberGroupIds.has(group.id);
        return <button key={group.id} type="button" disabled={isPending} aria-pressed={isMember}
          aria-label={`${isMember ? "Remove" : "Add"} ${group.name} membership for ${name}`}
          onClick={() => {
            const fd = new FormData(); fd.set("isMember", String(isMember));
            startTransition(async () => { const result = await toggleUserGroup(userId, group.id, fd); setError(result.error); setSaved(!result.error); });
          }} className={`rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${isMember ? "border-red-200 bg-red-50 text-red-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          <span aria-hidden="true">{isMember ? "✓ " : "+ "}</span>{group.name}
        </button>;
      })}</div>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
    <p role="status" className="mt-3 text-xs text-gray-600">{isPending ? "Saving…" : saved ? "Changes saved." : ""}</p>
  </li>;
}
