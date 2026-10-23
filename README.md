# Fortune Creative: start here (for Zack)

## 1. Make the repo

1. Create a new GitHub repo, for example `fortune-creative-site`.
2. Unzip this folder into it. `CLAUDE.md` stays at the root, because Claude Code reads it automatically.
3. Open the folder in Claude Code.

## 2. Make the test services (under your NLDM accounts)

- **Supabase:** a new, separate project named "Fortune Creative (staging)". Don't reuse the content portal's project, so it can be transferred to Dan cleanly later.
- **Vercel:** a new project in the same team as the content portal, connected to the repo. Give it a subdomain such as `fortune.neonlightsdgtl.com`.
- **Resend:** use your existing account. Until fortunecreative.com is verified, send from your verified NLDM domain to your own inbox.
- **Cloudflare Turnstile:** create a free site key for the subdomain.

## 3. First prompt to paste into Claude Code

> Read CLAUDE.md and everything in designs/. Before writing code, list anything that's unclear or conflicting. Then work through the build order one step at a time, starting with step 1, and stop after each step so I can review it at desktop and phone width.

## 4. Give Dan the tester link

- Set `SITE_STAGING=true` and a `STAGING_PASSWORD` in Vercel.
- Create Dan's admin login in Supabase Auth.
- Send him the site URL, the password, and `/admin` with his login.

## 5. Final handoff

1. Dan creates his own Supabase, Vercel and Resend accounts.
2. Transfer the Supabase project to his organization, and the Vercel project to his account or team. Both services support moving a project, which keeps the data and settings.
3. Point fortunecreative.com at Vercel, verify the domain in his Resend account, and update the env vars.
4. Remove `SITE_STAGING` and `STAGING_PASSWORD`.
5. Hand over the manuals.
