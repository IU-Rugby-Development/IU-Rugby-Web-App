# Database migrations

See [database setup and verification](../../docs/database.md). Apply SQL in numeric order only after inspecting the connected project's existing schema. 0006 and 0007 harden the original five migrations; event editing requires the 0007 save_event RPC.

The local test suite runs all migrations in an isolated PostgreSQL engine. It does not apply anything to hosted Supabase. This repository does not contain a linked Supabase CLI project configuration.
