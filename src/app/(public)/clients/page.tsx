import { createClient } from "@/lib/supabase/server";
import { storageUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Clients – Fortune Creative",
  description:
    "Current and recent clients of Fortune Creative, a press agency for Broadway and music.",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("position");

  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pt-16 pb-24 max-md:pt-8 max-md:pb-16">
      <div className="pb-6 border-b border-ink">
        <h1 className="font-serif font-normal text-[64px] max-md:text-[40px] leading-none tracking-[-0.01em]">
          Current and Recent Clients
        </h1>
      </div>
      <ul className="list-none m-0 p-0 grid grid-cols-3 max-[900px]:grid-cols-2 gap-x-8 gap-y-10 max-md:gap-x-4 max-md:gap-y-7 mt-10 max-md:mt-6">
        {(clients ?? []).map((client) => {
          const imgUrl = storageUrl("clients", client.image_path);
          return (
            <li key={client.id}>
              <a
                href={client.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-3 max-md:gap-2 text-ink no-underline group"
              >
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={client.name}
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-placeholder" />
                )}
                <span className="flex items-center max-md:items-start justify-between gap-3 max-md:gap-2 font-serif text-[20px] max-md:text-[17px] leading-[1.25]">
                  {client.name}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 max-md:mt-[3px] max-md:w-[14px] max-md:h-[14px]"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </span>
                <span className="sr-only">
                  (opens client website in a new tab)
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
