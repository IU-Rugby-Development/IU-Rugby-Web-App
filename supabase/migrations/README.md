# Database migrations

See [database state and verification](../../docs/database.md) for the mapping between numbered repo files and the live timestamp ledger. Migrations 0001–0008 are applied to the existing project. Inspect the ledger before any future application; do not replay them.

0006 prevents direct client activity fabrication and anonymous referral enumeration. 0007 saves events and group audiences atomically. 0008 hardens function search paths and EXECUTE grants while preserving authenticated RLS helpers.

The test suite runs all migrations in isolated PostgreSQL. Tests do not apply SQL to hosted Supabase. The sample seed is for isolated local development only.
