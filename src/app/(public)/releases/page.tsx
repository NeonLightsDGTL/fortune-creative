import { createClient } from "@/lib/supabase/server";
import { storageUrl, formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Releases",
  description:
    "Press releases from Fortune Creative covering Broadway, music, tours, and more.",
};

export const dynamic = "force-dynamic";

const PER_PAGE = 10;

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const supabase = await createClient();

  const { count } = await supabase
    .from("releases")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const { data: releases } = await supabase
    .from("releases")
    .select("*, tags(*)")
    .eq("status", "published")
    .order("release_date", { ascending: false })
    .range((safePage - 1) * PER_PAGE, safePage * PER_PAGE - 1);

  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pt-16 pb-24 max-md:pt-8 max-md:pb-16">
      <div className="pb-6 max-md:pb-4 border-b border-ink">
        <h1 className="font-serif font-normal text-[64px] max-md:text-[44px] leading-none tracking-[-0.01em]">
          Releases
        </h1>
      </div>

      <div className="flex flex-col">
        {(releases ?? []).map((r) => {
          const thumbUrl = storageUrl("releases", r.thumbnail_path);
          return (
            <article
              key={r.id}
              className="flex flex-wrap max-md:flex-nowrap max-md:flex-col gap-x-10 gap-y-6 max-md:gap-3 py-10 max-md:py-7 border-b border-border"
            >
              <Link
                href={`/releases/${r.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="flex-[0_1_340px] min-w-[240px] max-md:flex-auto max-md:min-w-0"
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt=""
                    width={340}
                    height={255}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-placeholder" />
                )}
              </Link>
              <div className="flex-[999_1_420px] max-md:flex-auto min-w-0 flex flex-col items-start gap-[14px] max-md:gap-3">
                <p className="m-0 flex flex-wrap items-center gap-x-[14px] gap-y-[6px] max-md:gap-x-3 max-md:gap-y-1 text-[12px] max-md:text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {r.tags && (
                    <>
                      <span className="text-accent">{r.tags.name}</span>
                      <span
                        aria-hidden="true"
                        className="w-px h-3 bg-[#8A8A8A]"
                      />
                    </>
                  )}
                  <time className="text-secondary">
                    {formatDate(r.release_date)}
                  </time>
                </p>
                <h2 className="m-0 font-serif font-medium text-[32px] max-md:text-[24px] leading-[1.18] max-md:leading-[1.2] [text-wrap:pretty]">
                  <Link
                    href={`/releases/${r.slug}`}
                    className="text-inherit no-underline"
                  >
                    {r.headline}
                  </Link>
                </h2>
                {r.blurb && (
                  <p className="m-0 max-w-[680px] text-[17px] max-md:text-[16px] leading-[1.55] max-md:leading-[1.5] text-secondary">
                    {r.blurb}
                  </p>
                )}
                <Link
                  href={`/releases/${r.slug}`}
                  className="mt-[6px] max-md:mt-0 inline-flex max-md:flex items-center justify-center gap-[10px] min-h-[44px] max-md:min-h-[48px] px-5 border border-accent text-accent no-underline text-[13px] font-semibold tracking-[0.14em] uppercase hover:bg-accent hover:text-white max-md:w-full"
                >
                  Read full release
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Release pages"
          className="flex flex-wrap items-center justify-between gap-4 pt-8 max-md:pt-6"
        >
          <span className="text-[14px] text-secondary">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-4">
            {safePage > 1 && (
              <Link
                href={`/releases?page=${safePage - 1}`}
                className="inline-flex items-center min-h-[44px] text-ink text-[14px] font-semibold"
              >
                Newer releases
              </Link>
            )}
            {safePage < totalPages && (
              <Link
                href={`/releases?page=${safePage + 1}`}
                className="inline-flex items-center min-h-[44px] text-ink text-[14px] font-semibold"
              >
                Older releases
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
