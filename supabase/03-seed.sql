-- Fortune Creative: seed data
-- Run this in Supabase SQL Editor AFTER 02-rls-and-storage.sql

-- Release tags
insert into tags (kind, name) values
  ('release', 'Broadway'),
  ('release', 'Off-Broadway'),
  ('release', 'Music'),
  ('release', 'Tour'),
  ('release', 'Awards'),
  ('release', 'Announcement')
on conflict (kind, name) do nothing;

-- Coverage tags
insert into tags (kind, name) values
  ('coverage', 'Interview'),
  ('coverage', 'Review'),
  ('coverage', 'Feature'),
  ('coverage', 'Roundup'),
  ('coverage', 'Profile')
on conflict (kind, name) do nothing;

-- About page (singleton)
insert into about (id, photo_path, photo_credit, bio) values (
  1,
  null,
  null,
  '<p><strong>Dan Fortune</strong> has enjoyed a varied career in arts publicity for over a decade.</p>
<p>Current projects include publicity for Ghostlight Records – the Grammy Award winning label behind Broadway albums <em>The Book of Mormon</em>, <em>Newsies</em> and the Tony Award winning shows <em>A Gentleman''s Guide to Love and Murder</em>, <em>The Bridges of Madison County</em> and <em>Beautiful: The Carole King Musical</em> – plus albums from John Schneider and Tom Wopat (celebrating 35 years of "The Dukes of Hazzard"), Laura Benanti ("Nashville" on ABC-TV, Tony Award winner for <em>Gypsy</em>), Maureen McGovern (three-time Grammy Award nominee) and Tituss Burgess ("30 Rock," <em>Jersey Boys</em>). Other projects include the short film "Grind" starring Anthony Rapp and the movie soundtrack to "The Last Five Years" starring Anna Kendrick and Jeremy Jordan.</p>
<p>Previous national album campaigns include Jane Krakowski, Ann Hampton Callaway, Steven Pasquale, Megan Mullally, Tony DeSare, Diane Schuur, Keely Smith, a number of Broadway cast recordings and the premiere release of the private home recordings of Stephen Sondheim. Solo concert engagements include Alan Cumming, Patti LuPone, Brian Stokes Mitchell, Petula Clark, Betty Buckley, Glen Campbell, Crystal Gayle, Jo Dee Messina, Brooke Shields, Donny Osmond and Diahann Carroll.</p>
<p>As Michael Feinstein''s personal publicist for over 10 years, Dan promoted his Grammy nominated albums, his PBS series "Michael Feinstein''s American Songbook," his book "The Gershwins and Me" from Simon &amp; Schuster, and his NPR program "Song Travels" in addition to his concerts with symphonies around the world. Dan now serves on the board of Feinstein''s Great American Songbook Foundation.</p>
<p>In addition, Dan has been personal press representative for Broadway talent such as Darlene Love (2011 Rock Hall of Fame Inductee) for her run in <em>Hairspray</em>, Tony Award nominee Haydn Gwynne in <em>Billy Elliot</em>, Tony Award nominee Felicia Felds in <em>The Color Purple</em> and Maria Friedman in <em>The Woman in White</em>. Other projects include shows both on and off Broadway and productions at the New York Musical Theater Festival, 59E59 Theaters, and other venues and festivals throughout the city.</p>
<p>Dan represented the York Theater Company for several years and worked on the Broadway productions of <em>George Gershwin Alone</em> and <em>The Gathering</em> with Hal Linden. New York venues include Feinstein''s at the Regency, Café Carlyle, 54 Below and The Algonquin Hotel''s Oak Room, in addition to jazz rooms like Birdland, The Blue Note and Jazz Standard.</p>
<p>Other major projects include the 2005 Harold Arlen Centennial, the 25th Anniversary season of The Philly Pops, the Johnny Mercer Foundation, and the 2001 Tony Awards hosted by Nathan Lane and Matthew Broderick.</p>
<p>He served as Associate Producer of "Radio Deluxe," John Pizzarelli''s nationally-syndicated radio program, and is the producer of the all-star concert "Night of a Thousand Judys." The evening honors Judy Garland as a benefit for the Ali Forney Center – which provides housing for homeless LGBT youth – which celebrated the 10th annual event in June 2022.</p>
<p>Dan formed Fortune Creative in March 2013.</p>'
) on conflict (id) do update set
  bio = excluded.bio,
  updated_at = now();

-- Sample clients (placeholder names from the designs)
insert into clients (name, url, image_path, position) values
  ('Client One', 'https://example.com', null, 1),
  ('Client Two', 'https://example.com', null, 2),
  ('Client Three', 'https://example.com', null, 3),
  ('Client Four', 'https://example.com', null, 4),
  ('Client Five', 'https://example.com', null, 5),
  ('Client Six', 'https://example.com', null, 6);

-- Sample carousel slides
insert into carousel_slides (client_name, caption, url, image_path, position) values
  ('Sample Client', 'A caption describing this slide and the project.', 'https://example.com', null, 1),
  ('Another Client', 'Caption for the second carousel slide.', null, null, 2);

-- Sample releases
insert into releases (slug, headline, release_date, tag_id, blurb, body, status) values
  (
    'show-title-announces-broadway-opening',
    '[Show Title] Announces Broadway Opening Night at the [Theatre Name]',
    '2026-10-01',
    (select id from tags where kind = 'release' and name = 'Broadway'),
    'Previews begin [date] ahead of an official opening on [date]. Tickets go on sale [date] through [ticketing partner].',
    '<p><strong>NEW YORK, NY (October 1, 2026).</strong> [Lead paragraph: who, what, when, where.]</p><p>[Second paragraph: supporting detail.]</p>',
    'published'
  ),
  (
    'artist-name-releases-new-album',
    '[Artist Name] Releases New Album "[Album Title]"',
    '2026-09-24',
    (select id from tags where kind = 'release' and name = 'Music'),
    '[One to two sentences on the album: label, producer, lead single, and where to listen.]',
    '<p><strong>NEW YORK, NY (September 24, 2026).</strong> [Lead paragraph.]</p>',
    'published'
  ),
  (
    'production-receives-award-nominations',
    '[Production] Receives [Number] [Award] Nominations',
    '2026-09-15',
    (select id from tags where kind = 'release' and name = 'Awards'),
    '[One to two sentences listing the nominated categories and the ceremony date.]',
    '<p><strong>NEW YORK, NY (September 15, 2026).</strong> [Lead paragraph.]</p>',
    'published'
  ),
  (
    'show-title-extends-run',
    '[Show Title] Extends Run at [Venue] Through [Date]',
    '2026-09-03',
    (select id from tags where kind = 'release' and name = 'Off-Broadway'),
    '[One to two sentences on the extension, cast changes, and ticket availability.]',
    '<p><strong>NEW YORK, NY (September 3, 2026).</strong> [Lead paragraph.]</p>',
    'published'
  ),
  (
    'artist-name-announces-tour',
    '[Artist Name] Announces [Year] North American Tour',
    '2026-08-20',
    (select id from tags where kind = 'release' and name = 'Tour'),
    '[One to two sentences on the routing, support acts, and presale dates.]',
    '<p><strong>NEW YORK, NY (August 20, 2026).</strong> [Lead paragraph.]</p>',
    'published'
  );

-- Sample coverage
insert into coverage (headline, outlet, url, published_date, tag_id, blurb, status) values
  (
    '[Artist Name] on the Making of "[Album Title]"',
    '[Outlet Name]',
    'https://example.com/article-1',
    '2026-09-30',
    (select id from tags where kind = 'coverage' and name = 'Interview'),
    '[One to two sentences on what the piece covers and why it matters.]',
    'published'
  ),
  (
    'Review: [Show Title] at the [Theatre Name]',
    '[Outlet Name]',
    'https://example.com/article-2',
    '2026-09-22',
    (select id from tags where kind = 'coverage' and name = 'Review'),
    '[One to two sentences, ideally a short pull line from the review.]',
    'published'
  ),
  (
    '[Number] Shows to See This Fall, Including [Show Title]',
    '[Outlet Name]',
    'https://example.com/article-3',
    '2026-09-12',
    (select id from tags where kind = 'coverage' and name = 'Roundup'),
    '[One to two sentences on which client is featured and how.]',
    'published'
  ),
  (
    'Inside the Rehearsal Room of [Show Title]',
    '[Outlet Name]',
    'https://example.com/article-4',
    '2026-09-02',
    (select id from tags where kind = 'coverage' and name = 'Feature'),
    '[One to two sentences on the angle of the feature.]',
    'published'
  ),
  (
    '[Headline as published by the outlet]',
    '[Outlet Name]',
    'https://example.com/article-5',
    '2026-08-25',
    (select id from tags where kind = 'coverage' and name = 'Profile'),
    '[One to two sentences on the profile subject and angle.]',
    'published'
  );
