# IU Rugby development

- Prioritize Phase 1 correctness, security, and Preview verification over new features.
- Preserve Next.js App Router, TypeScript, Tailwind, and Supabase. Keep code simple.
- Use feature branches. Never force-push main, merge automatically, or deploy Production without a separate instruction.
- Keep service-role credentials in server-only modules and ignored environment files. Never print secret values or member data in diagnostics.
- Check authorization in every mutation and preserve database RLS. Roles and stakeholder groups are distinct concepts.
- Run npm ci, npm run lint, npx tsc --noEmit, npm test, and npm run build. Verify Preview HTTP behavior and browser rendering; a green build is insufficient.
- Ticketing stays external at Kuntz/vivenu. Validate destination hosts. Referral clicks are not purchases, unique visitors, or revenue. No custom payment processing.
- Do not copy OptimX code, templates, or assets without confirmed reuse rights. Do not invent roster, sponsor, score, or event content.
- Do not change DNS, attach iurugby.com, or modify the existing live site.
- Apply SQL only through legitimate database-admin access. Document unverified migrations and external blockers honestly.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
