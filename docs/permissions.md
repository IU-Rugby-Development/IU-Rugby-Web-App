# Roles, stakeholder groups and RLS

Roles grant capabilities; groups describe associations. Names of project contributors are never part of authorization logic.

| Capability | MEMBER | EXECUTIVE | ADMIN |
| --- | --- | --- | --- |
| Own dashboard/profile | Yes | Yes | Yes |
| PUBLIC/MEMBERS events | Yes | Yes | Yes |
| GROUPS events | Assigned target groups only | All | All |
| Create/edit/delete events | No | Yes | Yes |
| User roles/group assignments | No | No | Yes |
| Manage ticket links | No | No | Yes |
| Referral traffic overview | No | Yes | Yes |
| Personal referral tool | Requires PLAYER group | Requires PLAYER group | Requires PLAYER group |

The database enforces RLS on all seven application tables. The referral view uses security_invoker. Members cannot self-promote, edit another user's role, assign their own groups, or write events. Administrators' server actions validate caller identity, IDs, inputs, the PLAYER target, and ticket destinations. The redirect route revalidates its destination and is the only application service-role use.

Migration 0006 revokes API client activity writes and removes anonymous ticket-link enumeration. Both changes assume the existing server-side referral route; no public client needs those direct database permissions.

## Public signup decision

The original trigger intentionally defaults every public signup to MEMBER, regardless of supplied role metadata. This behavior is preserved. It grants:
- MEMBERS event visibility immediately after authentication.
- Read access to profile names/roles and stakeholder memberships through the database API.
- Own profile-name editing, and group events only after an administrator assigns relevant groups.

Those events and associations may become sensitive. This pass could not inspect live content, so it cannot confirm they are appropriate for unrestricted public signup. Before entering private team information, stakeholders should explicitly accept current access or specify approval/invite behavior in a separate change. Do not label MEMBER as approved membership or add new roles casually.

Offline policy tests pass; live migration application, data sensitivity and authorization behavior remain unverified until backend configuration is restored.
