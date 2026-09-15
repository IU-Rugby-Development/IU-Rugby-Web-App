import type { CurrentUser } from "@/lib/auth/session";
import type { GroupName } from "@/types/domain";

/**
 * Central permission helpers. Import these everywhere instead of
 * re-deriving role/group checks inline in components or routes.
 *
 * IMPORTANT: these functions are UX/application-layer only. They make
 * the app behave correctly and keep unauthorized users from reaching
 * screens they shouldn't. They are NOT the security boundary — the
 * database enforces the real rules via Row Level Security (see
 * supabase/migrations and docs/permissions.md). Never assume that
 * because a page hid a button, the underlying data is protected.
 */

export function isInGroup(user: CurrentUser | null, group: GroupName): boolean {
  return !!user && user.groups.includes(group);
}

export function isMember(user: CurrentUser | null): boolean {
  return !!user;
}

export function isExecutive(user: CurrentUser | null): boolean {
  return user?.profile.role === "EXECUTIVE" || user?.profile.role === "ADMIN";
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.profile.role === "ADMIN";
}

export function canManageUsers(user: CurrentUser | null): boolean {
  return isAdmin(user);
}

export function canManageGroups(user: CurrentUser | null): boolean {
  return isAdmin(user);
}

export function canManageRoles(user: CurrentUser | null): boolean {
  return isAdmin(user);
}

export function canManageEvents(user: CurrentUser | null): boolean {
  return isExecutive(user);
}

export function canManageTicketLinks(user: CurrentUser | null): boolean {
  return isAdmin(user);
}

export function canViewAdmin(user: CurrentUser | null): boolean {
  return isAdmin(user);
}

export function canViewOwnReferralStats(
  user: CurrentUser | null,
  playerId: string
): boolean {
  return !!user && (user.id === playerId || isExecutive(user));
}

export function canViewReferralAnalytics(user: CurrentUser | null): boolean {
  return isExecutive(user);
}

export function hasPlayerLink(user: CurrentUser | null): boolean {
  return isInGroup(user, "PLAYER");
}
