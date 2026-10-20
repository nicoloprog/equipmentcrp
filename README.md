# FleetMail

This is a Next.js App Router equipment-maintenance app backed by Supabase and deployable on Vercel.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste `supabase/migrations/20261020000000_initial_equipment.sql`, and run it. This creates the equipment table, RLS policies, and the private `equipment-photos` storage bucket.
3. In **Project Settings → API**, copy the Project URL and publishable key.
4. Copy `.env.example` to `.env.local` and fill in the two values.
5. In **Authentication → Users**, create an email/password user. Unauthenticated visitors are redirected to `/login`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, sign in, then use **Add equipment**. The form inserts into Supabase and uploads optional photos to the private storage bucket.

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project**, import the repository, and keep the detected Next.js settings.
3. In **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production, Preview, and Development.
4. Deploy, open the deployed URL, and sign in with the Supabase user.

Never add a Supabase `service_role` key to Vercel or the browser. This setup uses the publishable key with Supabase Auth and RLS.
