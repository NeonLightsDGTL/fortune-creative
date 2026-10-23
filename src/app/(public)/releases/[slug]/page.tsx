import { createClient } from "@/lib/supabase/server";
import { storageUrl, formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: release } = await supabase
    .from("releases")
    .select("headline, blurb")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!release) return { title: "Release not found – Fortune Creative" };

  return {
    title: `${release.headline} – Fortune Creative`,
    description: release.blurb || release.headline,
    openGraph: {
      title: release.headline,
      description: release.blurb || release.headline,
      type: "article",
    },
  };
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: release } = await supabase
    .from("releases")
    .select("*, tags(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!release) notFound();

  const thumbUrl = storageUrl("releases", release.thumbnail_path);

  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pt-10 pb-24 max-md:pt-3 max-md:pb-16">
      <Link
        href="/releases"
        className="inline-flex items-center gap-2 min-h-[44px] text-ink no-underline text-[13px] max-md:text-[12px] font-semibold tracking-[0.14em] uppercase"
      >
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
          <path d="M19 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </svg>
        All releases
      </Link>

      <article className="max-w-[780px] mx-auto mt-8 max-md:mt-4 flex flex-col gap-7 max-md:gap-[22px]">
        <header className="flex flex-col gap-[18px] max-md:gap-[14px] pb-7 max-md:pb-5 border-b border-ink">
          <p className="m-0 flex flex-wrap items-center gap-x-[14px] gap-y-[6px] max-md:gap-x-3 max-md:gap-y-1 text-[12px] max-md:text-[11px] font-semibold tracking-[0.14em] uppercase">
            {release.tags && (
              <>
                <span className="text-accent">{release.tags.name}</span>
                <span
                  aria-hidden="true"
                  className="w-px h-3 bg-[#8A8A8A]"
                />
              </>
            )}
            <time className="text-secondary">
              {formatDate(release.release_date)}
            </time>
          </p>
          <h1 className="m-0 font-serif font-normal text-[clamp(34px,4.2vw,54px)] max-md:text-[32px] leading-[1.1] max-md:leading-[1.12] tracking-[-0.01em] [text-wrap:balance]">
            {release.headline}
          </h1>
        </header>

        {thumbUrl && (
          <figure className="m-0 max-md:mx-[-20px] flex flex-col gap-[10px] max-md:gap-2">
            <Image
              src={thumbUrl}
              alt=""
              width={780}
              height={439}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        )}

        {release.body && (
          <div
            className="release-body flex flex-col gap-[22px] max-md:gap-[18px] font-serif text-[20px] max-md:text-[18px] leading-[1.6] [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic [&_h2]:m-0 [&_h2]:mt-3 max-md:[&_h2]:mt-[10px] [&_h2]:font-sans [&_h2]:text-[13px] max-md:[&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:tracking-[0.14em] [&_h2]:uppercase [&_blockquote]:mx-0 [&_blockquote]:my-2 max-md:[&_blockquote]:my-[6px] [&_blockquote]:py-1 max-md:[&_blockquote]:py-[2px] [&_blockquote]:pl-7 max-md:[&_blockquote]:pl-[18px] [&_blockquote]:border-l [&_blockquote]:border-ink [&_blockquote]:text-[24px] max-md:[&_blockquote]:text-[21px] [&_blockquote]:leading-[1.45] [&_blockquote]:italic [&_a]:text-ink [&_a:hover]:text-accent"
            dangerouslySetInnerHTML={{ __html: release.body }}
          />
        )}

        {release.include_contact_block && (
          <aside
            aria-label="Press contact"
            className="flex flex-wrap max-md:flex-col gap-x-10 gap-y-2 max-md:gap-[6px] py-6 max-md:py-5 border-t border-b border-ink text-[15px] leading-[1.5]"
          >
            <p className="m-0 flex-[1_1_100%] text-[12px] max-md:text-[11px] font-semibold tracking-[0.14em] uppercase">
              Press contact
            </p>
            <p className="m-0">Dan Fortune, Fortune Creative</p>
            <a
              href="mailto:dan@fortunecreative.com"
              className="text-ink max-md:min-h-[32px] max-md:inline-flex max-md:items-center"
            >
              dan@fortunecreative.com
            </a>
            <a
              href="tel:+19176081309"
              className="text-ink max-md:min-h-[32px] max-md:inline-flex max-md:items-center"
            >
              (917) 608-1309
            </a>
          </aside>
        )}
      </article>
    </div>
  );
}
