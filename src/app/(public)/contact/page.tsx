import EmailDialog from "@/components/email-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Fortune Creative",
  description:
    "Get in touch with Dan Fortune at Fortune Creative for press inquiries.",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 pt-16 pb-28 max-md:pt-8 max-md:pb-16">
      <div className="pb-6 max-md:pb-4 border-b border-ink">
        <h1 className="font-serif font-normal text-[64px] max-md:text-[44px] leading-none tracking-[-0.01em]">
          Contact
        </h1>
      </div>
      <div className="mt-12 max-md:mt-7 max-w-[880px] flex flex-col items-start gap-8">
        <div className="self-stretch flex flex-wrap max-md:flex-col gap-5 max-md:gap-3">
          {/* Phone card */}
          <div className="flex-[1_1_300px] max-md:flex-[0_0_auto] p-7 max-md:p-5 border border-ink flex gap-4 items-start">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 mt-[2px]"
            >
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
            <span className="flex flex-col gap-[6px] min-w-0">
              <span className="text-[12px] font-semibold tracking-[0.14em] uppercase">
                Phone
              </span>
              <a
                href="tel:+19176081309"
                className="font-serif text-[22px] max-md:text-[19px] break-all text-ink no-underline"
              >
                (917) 608-1309
              </a>
            </span>
          </div>

          {/* Email card */}
          <div className="flex-[1_1_300px] max-md:flex-[0_0_auto] p-7 max-md:p-5 border border-ink flex gap-4 items-start">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 mt-[2px]"
            >
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <span className="flex flex-col gap-[6px] min-w-0">
              <span className="text-[12px] font-semibold tracking-[0.14em] uppercase">
                Email
              </span>
              <a
                href="mailto:dan@fortunecreative.com"
                className="font-serif text-[22px] max-md:text-[19px] break-all text-ink no-underline"
              >
                dan@fortunecreative.com
              </a>
              <EmailDialog />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
