# GATE OS Supabase rollback notes

## Policy

Migrations are forward-only once applied to a shared Supabase environment. Do not edit or delete an applied migration. Use a new, timestamped migration that restores the desired behavior, then run the verification SQL again.

`202607180001_public_beta_schema.sql` creates tables, enum types, RLS policies, functions, triggers, indexes, and the `private-notes` storage bucket. Removing it from an environment with user data is destructive and is not a production rollback path.

`202607180002_seed_gate_2027_cs_it_catalog.sql` contains shared catalog data only. If the catalog needs correction, add a new data-only migration that creates a new exam version or updates the working catalog; do not rewrite a published catalog version in place.

## Safe correction patterns

- Incorrect RLS policy: add a new migration that drops only the named policy and creates its replacement.
- Incorrect index: add a new migration that drops or creates only that index. Use `CREATE INDEX CONCURRENTLY` for new indexes on populated production tables, in a migration runner mode that permits it.
- New required column: add it nullable or with a default, deploy the application, backfill in a data-only migration, then add validation in a later migration.
- Catalog correction: insert a new `exam_versions` row and map topics in a dedicated seed migration. Preserve existing user progress against its original version.
- Storage policy correction: replace the named `storage.objects` policy; never make `private-notes` public to work around an access issue.

## Local development reset only

For an empty local development database, use the Supabase CLI reset workflow so migrations are replayed in order. Do not run a hand-written `DROP SCHEMA public CASCADE` against a shared or production environment because it can remove data outside this feature.

## Emergency data preservation

Before any destructive production operation, export the affected tables and list the private storage object paths. Restore schema through a new forward migration, restore records using a reviewed data migration, then validate with `verification/001_public_beta_schema.sql` and two-user RLS integration tests.
