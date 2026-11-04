# Supabase: the room and the live numbers

CRUX uses one small Supabase project for two things:

- **The room** on the home page: a live chat where visitors appear as a random
  name like "tired koala", plus a "who's here now" count.
- **Live numbers** on the About page: visitors per day for the last 7, 30 and
  90 days, hours listened, and the three most played sessions.

Nothing in it identifies a person. The browser creates a random id and a random
name and keeps them in its own localStorage; the database only ever sees those.

## One-time setup

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   plenty). Pick the Sydney region.
2. Open **SQL Editor**, paste the whole of
   [`migrations/20261105000000_live_room.sql`](migrations/20261105000000_live_room.sql)
   and run it. It creates the tables, the row-level-security policies, the
   message guard trigger, realtime on `messages`, and the `live_stats()`
   function. Running it again is safe.

   Or, with the Supabase CLI: `supabase link --project-ref <ref>` then
   `supabase db push`.
3. In **Project Settings → API**, copy the **Project URL** and the **anon
   public** key.
4. Add them to the app:
   - Locally: `.env.local` →
     `NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"` and
     `NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"`.
   - On Vercel: **Settings → Environment Variables**, same two names, for
     Production and Preview, then redeploy.

Until both variables are set the app hides the room and shows "Live numbers are
being switched on." on the About page, so it is safe to ship the code first.

## What the public key can do

The app only holds the anon key, and these policies are the whole of its power:

| Table      | Insert | Read                     |
| ---------- | ------ | ------------------------ |
| `visits`   | yes    | no (aggregates only)     |
| `plays`    | yes    | no (aggregates only)     |
| `messages` | yes    | rows from the last 24 h  |
| `reports`  | yes    | no                       |

`live_stats()` runs as the database owner and returns only counts and sums.

## Guard rails on the room

`guard_message()` runs before every insert into `messages`:

- more than two messages in ten seconds from the same visitor → rejected
  ("slow down");
- links, email addresses and phone numbers are replaced with `[... removed]`;
- a short list of slurs and the harshest words is masked with asterisks (the
  same list lives in `src/lib/roomRules.ts` for the browser-side check);
- names must match `^[a-z][a-z -]{2,39}$`.

Messages older than 24 hours are invisible to the app. To delete them for real,
enable the `pg_cron` extension and schedule the statement at the bottom of the
migration file.

## Moderation

The **Report** button on a message writes a row to `reports`. There is no
admin UI yet; look at the table in the Supabase dashboard
(`select m.*, count(r.*) from messages m join reports r on r.message_id = m.id group by m.id`).
To remove a message, delete the row; every open room drops it on its next
load.
