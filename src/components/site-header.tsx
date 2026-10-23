"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/clients", label: "Clients" },
  { href: "/releases", label: "Releases" },
  { href: "/coverage", label: "Coverage" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SignupForm({
  id,
  mobile,
}: {
  id: string;
  mobile?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p
        role="status"
        className={`m-0 text-[${mobile ? "16" : "15"}px] leading-[1.4] ${
          mobile
            ? "py-3.5 border-t border-b border-ink"
            : "min-w-[260px] py-3 border-t border-b border-ink"
        }`}
      >
        Thank you for signing up for the Fortune Creative press release
        distribution list.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className={`flex flex-col ${mobile ? "gap-2.5" : "gap-2"}`}
    >
      <label
        htmlFor={id}
        className="text-[12px] font-semibold tracking-[0.14em] uppercase"
      >
        Sign up to receive press releases
      </label>
      {mobile ? (
        <>
          <input
            id={id}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@outlet.com"
            className="h-12 px-3 border border-ink rounded-none font-sans text-[16px] text-ink bg-white"
          />
          <button
            type="submit"
            className="min-h-12 px-3 border-0 rounded-none bg-ink text-white font-sans text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer"
          >
            Submit
          </button>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input
            id={id}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@outlet.com"
            className="flex-[1_1_220px] min-w-0 h-11 px-3 border border-ink rounded-none font-sans text-[15px] text-ink bg-white"
          />
          <button
            type="submit"
            className="flex-none h-11 px-[18px] border-0 rounded-none bg-ink text-white font-sans text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer"
          >
            Submit
          </button>
        </div>
      )}
    </form>
  );
}

function DesktopHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white text-ink font-sans max-md:hidden">
      <div className="max-w-[1280px] mx-auto px-8 pt-5 pb-[18px] box-border flex flex-wrap items-end justify-between gap-y-5 gap-x-12">
        <Link href="/" className="flex items-center min-h-11">
          <Image
            src="/fortune-creative-logo-black.png"
            alt="Fortune Creative home"
            width={300}
            height={60}
            className="block w-[300px] h-auto"
            priority
          />
        </Link>
        <div className="flex-[0_1_460px] min-w-[260px]">
          <SignupForm id="fc-list-email" />
        </div>
      </div>
      <nav
        aria-label="Main"
        className="border-t border-ink"
        style={{ borderBottom: "4px double #111111" }}
      >
        <ul className="list-none m-0 mx-auto max-w-[1280px] px-8 flex flex-wrap gap-x-10">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} className="flex">
              <Link
                href={href}
                {...(isCurrent(pathname, href)
                  ? { "aria-current": "page" as const }
                  : {})}
                className={`inline-flex items-center min-h-12 text-ink no-underline text-[13px] font-semibold tracking-[0.14em] uppercase ${
                  isCurrent(pathname, href)
                    ? "shadow-[inset_0_-3px_0_var(--color-accent)]"
                    : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="w-full bg-white text-ink font-sans md:hidden"
      style={{ borderBottom: "4px double #111111" }}
    >
      <div className="h-[68px] px-3 pl-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center min-h-11">
          <Image
            src="/fortune-creative-logo-black.png"
            alt="Fortune Creative home"
            width={140}
            height={28}
            className="block w-[140px] h-auto"
            priority
          />
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="m-menu"
          onClick={() => setOpen(!open)}
          className="w-12 h-12 flex items-center justify-center border-0 bg-transparent text-ink cursor-pointer"
        >
          {open ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l14 14" />
              <path d="M19 5L5 19" />
            </svg>
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 7h18" />
              <path d="M3 12h18" />
              <path d="M3 17h18" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div
          id="m-menu"
          className="min-h-[700px] px-5 pt-2 pb-10 border-t border-ink flex flex-col gap-8"
        >
          <nav aria-label="Main">
            <ul className="list-none m-0 p-0 flex flex-col">
              {NAV_LINKS.map(({ href, label }) => {
                const current = isCurrent(pathname, href);
                return (
                  <li key={href} className="border-b border-border">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      {...(current
                        ? { "aria-current": "page" as const }
                        : {})}
                      className={`flex items-center min-h-[60px] no-underline font-serif text-[28px] ${
                        current
                          ? "text-accent justify-between"
                          : "text-ink"
                      }`}
                    >
                      {label}
                      {current && (
                        <span
                          aria-hidden="true"
                          className="w-2 h-2 bg-accent"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <SignupForm id="m-list-email" mobile />
        </div>
      )}
    </header>
  );
}

export default function SiteHeader() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}
