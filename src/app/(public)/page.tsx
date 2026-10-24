import { createClient } from "@/lib/supabase/server";
import { storageUrl, formatDate } from "@/lib/utils";
import Carousel from "@/components/carousel";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Fortune Creative | Press Agency for Broadway and Music",
  },
  description:
    "A press agency for artists, productions, and organizations across Broadway and music.",
  openGraph: {
    title: "Fortune Creative",
    description:
      "A press agency for artists, productions, and organizations across Broadway and music.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [slidesRes, releasesRes, coverageRes] = await Promise.all([
    supabase
      .from("carousel_slides")
      .select("*")
      .order("position"),
    supabase
      .from("releases")
      .select("*, tags(*)")
      .eq("status", "published")
      .order("release_date", { ascending: false })
      .limit(4),
    supabase
      .from("coverage")
      .select("*, tags(*)")
      .eq("status", "published")
      .order("published_date", { ascending: false })
      .limit(4),
  ]);

  const slides = (slidesRes.data ?? []).map((s) => ({
    id: s.id,
    client_name: s.client_name,
    caption: s.caption,
    url: s.url,
    image_url: storageUrl("carousel", s.image_path),
  }));

  const releases = releasesRes.data ?? [];
  const coverage = coverageRes.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pb-28 max-md:pb-16">
      {/* Tagline */}
      <h1 className="m-0 pt-14 pb-10 max-md:pt-8 max-md:pb-6 max-w-[1040px] font-serif font-normal text-[clamp(34px,4.4vw,58px)] max-md:text-[32px] leading-[1.1] max-md:leading-[1.12] tracking-[-0.01em] [text-wrap:balance]">
        A press agency for artists, productions, and organizations across
        Broadway and music.
      </h1>

      {/* Carousel */}
      <Carousel slides={slides} />

      {/* Recent Releases */}
      <section
        aria-labelledby="recent-releases"
        className="mt-20 max-md:mt-12 flex flex-col gap-7 max-md:gap-6"
      >
        <h2
          id="recent-releases"
          className="m-0 pb-4 max-md:pb-3 border-b border-ink font-serif font-normal text-[44px] max-md:text-[32px] leading-none"
        >
          Recent Releases
        </h2>
        <div className="grid grid-cols-5 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6">
          {releases.map((r) => {
            const thumbUrl = storageUrl("releases", r.thumbnail_path);
            return (
              <article
                key={r.id}
                className="min-w-0 flex flex-col gap-3 max-md:gap-[10px]"
              >
                <Link
                  href={`/releases/${r.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt=""
                      width={240}
                      height={180}
                      className="aspect-[4/3] max-md:aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] max-md:aspect-[16/9] w-full bg-placeholder" />
                  )}
                </Link>
                <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {r.tags && (
                    <span className="text-accent">{r.tags.name}</span>
                  )}
                  <time className="text-secondary">
                    {formatDate(r.release_date)}
                  </time>
                </p>
                <h3 className="m-0 font-serif font-medium text-[20px] max-md:text-[21px] leading-[1.25] [text-wrap:pretty]">
                  <Link
                    href={`/releases/${r.slug}`}
                    className="text-inherit no-underline"
                  >
                    {r.headline}
                  </Link>
                </h3>
              </article>
            );
          })}
          <Link
            href="/releases"
            className="self-center flex flex-col items-center justify-center gap-[10px] p-4 max-md:py-0 max-md:min-h-[56px] max-md:flex-row border border-accent text-accent no-underline text-center text-[13px] font-semibold tracking-[0.14em] leading-[1.5] uppercase hover:bg-accent hover:text-white"
          >
            Read all releases
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="max-md:w-[14px] max-md:h-[14px]"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Recent Coverage */}
      <section
        aria-labelledby="recent-coverage"
        className="mt-20 max-md:mt-14 flex flex-col gap-7 max-md:gap-6"
      >
        <h2
          id="recent-coverage"
          className="m-0 pb-4 max-md:pb-3 border-b border-ink font-serif font-normal text-[44px] max-md:text-[32px] leading-none"
        >
          Recent Coverage
        </h2>
        <div className="grid grid-cols-5 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1 gap-6">
          {coverage.map((c) => {
            const thumbUrl = storageUrl("coverage", c.thumbnail_path);
            return (
              <article
                key={c.id}
                className="min-w-0 flex flex-col gap-3 max-md:gap-[10px]"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt=""
                      width={240}
                      height={180}
                      className="aspect-[4/3] max-md:aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] max-md:aspect-[16/9] w-full bg-placeholder" />
                  )}
                </a>
                <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {c.tags && (
                    <span className="text-accent">{c.tags.name}</span>
                  )}
                  <time className="text-secondary">
                    {formatDate(c.published_date)}
                  </time>
                </p>
                <p className="m-0 font-serif italic text-[16px]">
                  {c.outlet}
                </p>
                <h3 className="m-0 font-serif font-medium text-[20px] max-md:text-[21px] leading-[1.25] [text-wrap:pretty]">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-inherit no-underline"
                  >
                    {c.headline}
                  </a>
                </h3>
              </article>
            );
          })}
          <Link
            href="/coverage"
            className="self-center flex flex-col items-center justify-center gap-[10px] p-4 max-md:py-0 max-md:min-h-[56px] max-md:flex-row border border-accent text-accent no-underline text-center text-[13px] font-semibold tracking-[0.14em] leading-[1.5] uppercase hover:bg-accent hover:text-white"
          >
            Read all coverage
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="max-md:w-[14px] max-md:h-[14px]"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
