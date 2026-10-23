import { createClient } from "@/lib/supabase/server";
import { storageUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Dan Fortune",
  description:
    "Dan Fortune, President of Fortune Creative, has enjoyed a varied career in arts publicity for over a decade.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase
    .from("about")
    .select("*")
    .eq("id", 1)
    .single();

  const photoUrl = about ? storageUrl("about", about.photo_path) : null;

  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pt-16 pb-28 max-md:pt-8 max-md:pb-16 flex flex-wrap max-md:flex-nowrap items-start gap-x-[72px] gap-y-12 max-md:flex-col max-md:gap-6">
      {/* Mobile header — above photo */}
      <header className="hidden max-md:flex flex-col gap-[10px]">
        <p className="m-0 text-[11px] font-semibold tracking-[0.14em] uppercase text-accent">
          About
        </p>
        <h1 className="font-serif font-normal text-[44px] leading-none">
          Dan Fortune
        </h1>
        <p className="m-0 text-[15px] text-secondary">
          President, Fortune Creative
        </p>
      </header>

      <figure className="m-0 flex-[1_1_360px] max-w-[460px] max-md:max-w-none max-md:flex-auto max-md:self-stretch flex flex-col gap-[10px] max-md:gap-2">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt="Dan Fortune"
            width={460}
            height={575}
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-placeholder" />
        )}
        {about?.photo_credit && (
          <figcaption className="text-[13px] text-secondary">
            {about.photo_credit}
          </figcaption>
        )}
      </figure>

      <article className="flex-[999_1_520px] min-w-0 max-w-[720px] max-md:max-w-none max-md:flex-auto flex flex-col gap-6">
        {/* Desktop header — beside photo */}
        <header className="flex flex-col gap-3 pb-6 border-b border-ink max-md:hidden">
          <p className="m-0 text-[12px] font-semibold tracking-[0.14em] uppercase text-accent">
            About
          </p>
          <h1 className="font-serif font-normal text-[64px] leading-none tracking-[-0.01em]">
            Dan Fortune
          </h1>
          <p className="m-0 text-[16px] text-secondary">
            President, Fortune Creative
          </p>
        </header>

        {about?.bio && (
          <div
            className="flex flex-col gap-[22px] max-md:gap-[18px] max-md:pt-5 max-md:border-t max-md:border-ink font-serif text-[20px] max-md:text-[18px] leading-[1.65] [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: about.bio }}
          />
        )}
      </article>
    </div>
  );
}
