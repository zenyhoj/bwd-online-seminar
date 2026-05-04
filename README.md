# Online Water Application System

Production-ready starter for a multi-tenant online water application workflow built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Install dependencies:

```bash
npm install
```

4. For a brand-new Supabase project, apply SQL in order:

```sql
-- Run supabase/schema.sql
-- Then run supabase/rls.sql
```

Do not rerun `supabase/schema.sql` on an existing database. It is a bootstrap file and will fail on objects that already exist, like enum types and tables.

If your Supabase project already exists and only needs newer fields, run just the incremental patch files in `supabase/`, especially:

```sql
-- Run supabase/inspection-material-list.sql
-- Run supabase/inspection-account-fields.sql
-- Run supabase/drop-unused-inspection-columns.sql
-- Run any newer one-off patch files in this folder that are not yet in your live database
```

5. Start locally:

```bash
npm run dev
```

## Deployment

1. Create a Vercel project from this repository.
2. Add the same Supabase environment variables in Vercel.
3. Confirm `NEXT_PUBLIC_SUPABASE_URL` points to `https://oisbqqjaehvlhsvesrxo.supabase.co`.
4. Deploy with:

```bash
npm run build
```

## Structure

- `app/`: App Router routes for auth, applicant, admin, and inspector.
- `actions/`: Server Actions for all mutations.
- `components/`: Reusable UI and feature components.
- `lib/`: Supabase setup, auth guards, pagination, and shared helpers.
- `schemas/`: Zod validation schemas.
- `supabase/`: SQL schema and RLS policies.
- `types/`: Fully typed domain and database models.
