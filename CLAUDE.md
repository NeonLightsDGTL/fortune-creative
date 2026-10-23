# Fortune Creative website: build spec

Public website plus a private admin for Fortune Creative, a press agency for music and theatre run by Dan Fortune. Zack (Neon Lights Digital Media) builds it, populates it, hosts a test version for Dan, then transfers everything to Dan's own accounts with written manuals.

The approved designs are in `designs/`. Treat them as the source of truth for layout, spacing, copy and behavior. This file covers what the designs can't show: stack, data, routes, auth, email and deployment.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres, Auth (admin login only), Storage (images)
- Resend for the one transactional email (release list signups)
- Vercel for hosting

Use server rendering for public pages. Release pages need real `<title>`, description and Open Graph tags so links look right when shared.

## How to read `designs/`

Each `*.dc.html` file is a design mockup in a canvas format, not production code. Ignore `<x-dc>`, `<helmet>`, `support.js`, `<sc-for>`, `<sc-if>`, `<dc-import>`, `{{holes}}` and the `class Component extends DCLogic` script. They are the mockup runtime. Read them for:

- Markup structure, inline styles (exact sizes, spacing, colors), and copy
- The script's `renderVals()` for sample data shapes and interaction behavior (filters, undo, confirm-before-delete, carousel timing, form states)
- `/_blob/...` image URLs are canvas-hosted assets. Use the files in `assets/` instead. Gray hatched boxes (`.ph`) are image placeholders.

Desktop and mobile versions are separate files (`Mobile*.dc.html`). Build one responsive site, using the mobile files as the spec for narrow screens (breakpoint around 768px). `SiteHeader` / `MobileHeader` and `MobileAdminHeader` are shared components.

## Design tokens

- Ink `#111111`, white `#FFFFFF`
- Text secondary `#4A4A4A`, captions `#555555`
- Rules and borders `#D9D9D6`, light rule `#ECEBE7`, admin background `#F4F4F2`, placeholder `#ECEBE7`
- Accent (Dan's blue) `#5D7AA5`: category tags, current-nav underline, focus rings, link hover. It is 4.4:1 on white, just under AA for small text. Ask Zack whether to use `#5A77A2` (4.6:1) for small text.
- Danger `#A3152A`: admin delete/remove only. Danger tint `#FBF3F4`.
- Fonts are web-safe only, no web fonts:
  - Serif: `Georgia, 'Times New Roman', serif` for headlines, page titles, body copy of releases and bio
  - Sans: `'Helvetica Neue', Helvetica, Arial, sans-serif` for UI, labels, nav, buttons
- Labels and buttons: 12–13px, weight 600, letter-spacing 0.14em, uppercase
- Rules: 1px solid ink under page titles; header and nav use a 4px double ink rule
- Square corners everywhere (radius 0). No shadows except modals.
- Content max width 1280px, side padding 32px desktop / 20px mobile
- Touch targets at least 44px

## Public site

Routes:

| Route | Design | Notes |
|---|---|---|
| `/` | `Main`, `MobileHome` | Tagline, client carousel, Recent Releases (4 + "Read all releases" box), Recent Coverage (4 + "Read all coverage" box) |
| `/clients` | `Clients`, `MobileClients` | H1 "Current and Recent Clients" (nav label stays CLIENTS). 3 columns desktop, 2 tablet and phone. Square images link to the client site in a new tab, name under each. |
| `/releases` | `Releases`, `MobileReleases` | Published only, newest first, 10 per page, "Older releases" pagination |
| `/releases/[slug]` | `ReleaseDetail`, `MobileRelease` | Full release. No "For immediate release" line. Optional press contact block at the end. |
| `/coverage` | `Coverage`, `MobileCoverage` | Published only, newest first. Card links and button go to the outlet URL in a new tab. |
| `/about` | `About`, `MobileAbout` | Photo, credit, "President, Fortune Creative", bio from the `about` row (rich text: bold and italics must survive) |
| `/contact` | `Contact`, `MobileContact` | Phone and Email cards only. EMAIL ME button inside the Email card. |

Header (every public page):

- Logo (`assets/fortune-creative-logo-black.png`, about 300px wide on desktop, about 140px on mobile) links home.
- Signup: label "SIGN UP TO RECEIVE PRESS RELEASES", email field, SUBMIT button. On success, hide the label, field and button and show: "Thank you for signing up for the Fortune Creative press release distribution list."
- Nav: Home, Clients, Releases, Coverage, About, Contact. The current page gets a 3px accent underline.
- On mobile it collapses to logo + hamburger. The menu holds the nav and the signup (`MobileMenu`).
- No footer.

Home carousel:

- Slides come from `carousel_slides` in position order.
- Autoplays every 6 seconds, with previous/next, dot buttons, a play/pause icon button (triangle / two bars), and swipe on touch.
- Respect `prefers-reduced-motion` by not autoplaying.
- Caption under the image: client name (linked if the slide has a URL) + caption.

Contact, EMAIL ME:

- Opens an on-page dialog: "What project is this about?" with a Project name field, OPEN EMAIL and CANCEL.
- On submit, go to `mailto:dan@fortunecreative.com?subject=` + encoded `NEW BUSINESS INQUIRY: {project}`.
- Phone: (917) 608-1309 (`tel:+19176081309`). Email: dan@fortunecreative.com.

## Data (Supabase)

```
clients          id uuid pk, name text, url text, image_path text, position int, created_at
carousel_slides  id uuid pk, client_name text, caption text, url text null, image_path text, position int, created_at
tags             id uuid pk, kind text check (kind in ('release','coverage')), name text, unique(kind, name)
releases         id uuid pk, slug text unique, headline text, release_date date, tag_id uuid null references tags on delete set null,
                 thumbnail_path text, blurb text check (char_length(blurb) <= 240), body jsonb or text (rich text),
                 include_contact_block bool default true, status text check (status in ('draft','published')),
                 created_at, updated_at
coverage         id uuid pk, headline text, outlet text, url text, published_date date, tag_id uuid null references tags on delete set null,
                 thumbnail_path text, blurb text check (char_length(blurb) <= 240), status text ('draft','published'), created_at, updated_at
about            id int pk default 1 check (id = 1), photo_path text, photo_credit text, bio jsonb or text, updated_at
signups          id uuid pk, email text, created_at   -- backup log only; Dan works from the emails
```

- Storage buckets, public read: `clients`, `carousel`, `releases`, `coverage`, `about`.
- RLS: anyone can read `clients`, `carousel_slides`, `tags`, `about`, and published `releases` / `coverage`. Only authenticated users can write. Only the server (service role) can insert into `signups`.
- Seed tags. Release: Broadway, Off-Broadway, Music, Tour, Awards, Announcement. Coverage: Interview, Review, Feature, Roundup, Profile.
- Seed `about` with the bio and contact copy from `designs/public/About.dc.html`. Keep the bold name and italic show titles. Leave "Felicia Felds" and "June 2022" as written; Dan is reviewing them.

## Admin (`/admin`)

- Login with Supabase Auth (email + password). One admin user (Dan). No public sign-up. Protect every `/admin` route with middleware.
- Desktop: black sidebar with the white logo, then Home, Clients, Releases, Coverage, About, and "View live site". Mobile: `MobileAdminHeader` with a dropdown menu.

| Route | Design | Behavior |
|---|---|---|
| `/admin` | `AdminCarousel` | Carousel slides: drag to reorder on desktop, up/down arrows everywhere (touch), add/edit form, remove with Undo |
| `/admin/clients` | `AdminClients` | Same pattern; new clients go to the top |
| `/admin/releases` | `AdminReleases` | All releases, newest first. Filters: All / Published / Drafts with counts. Row actions as icons: pencil (edit), eye (view), red trash (delete with inline confirm, then Undo) |
| `/admin/releases/new` and `/[id]` | `AdminRelease` | Headline (auto slug), date, tag select + "Manage tags" modal, thumbnail, blurb with 240 counter, rich-text body (Bold, Italic, H2, quote, link, image), contact-block checkbox, live preview card, Save draft / Publish, trash icon to delete with confirm. Title reads "Edit Release" when editing. |
| `/admin/coverage` | `AdminCoverageList` | Same as releases list |
| `/admin/coverage/new` and `/[id]` | `AdminCoverage` | Article URL, headline, outlet, date, tag + Manage tags, thumbnail, blurb, live preview |
| `/admin/about` | `AdminAbout` | Replace photo, photo credit, rich-text bio (Bold, Italic, Link), Save changes, View page |

Manage tags modal (`TagModal`): scoped to the editor it opens from. Add, rename (pencil), delete (trash). Deleting a tag that's in use asks first and leaves those items untagged.

Icons: inline stroke SVGs as drawn in the designs. Every icon-only button needs `aria-label` and `title`.

## Email (Resend)

One email only: a release list signup, sent to Dan. Design: `designs/emails/EmailSignup.dc.html`.

- From: `Fortune Creative Website <website@fortunecreative.com>`
- To: `dan@fortunecreative.com`
- Subject: `New release list signup: {email}`
- No reply-to.
- Body: logo, "Release distribution list", "New Signup", one sentence, and the address in a bordered box. Nothing below the box.
- Use web-safe fonts and inline styles. Send a plain-text part too.
- Flow: server action validates the address, rejects bots (hidden honeypot field + Cloudflare Turnstile), rate-limits by IP, inserts into `signups`, then sends.

## Environments

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `SIGNUP_NOTIFY_TO`, `SIGNUP_FROM`
- `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_STAGING=true` on the test deployment adds `noindex` site-wide and blocks robots.
- `STAGING_PASSWORD` (optional): when set, middleware asks for a simple password before showing the public site, so only Dan can see the test version.

On staging, `SIGNUP_NOTIFY_TO` points at Zack and `SIGNUP_FROM` uses a domain already verified in Zack's Resend account, until fortunecreative.com is verified.

## Build order

1. Scaffold Next.js + Tailwind with the tokens above; shared header (desktop + mobile).
2. Supabase schema, RLS, buckets, seed data (sample placeholder content from the designs).
3. Public pages reading from Supabase.
4. Admin auth + layout, then each admin screen.
5. Signup email via Resend + spam protection.
6. SEO: metadata, Open Graph, sitemap; staging noindex.
7. Deploy to Vercel staging.

Check each page against its design file at desktop and 390px wide before moving on.
