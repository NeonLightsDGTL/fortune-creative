"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { signupAction } from "@/lib/signup-action";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void }
      ) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

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

function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const mount = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onTokenRef.current(token),
    });
  }, [siteKey]);

  useEffect(() => {
    mount();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [mount]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={mount}
      />
      <div ref={containerRef} />
    </>
  );
}

function SignupForm({
  id,
  mobile,
  turnstileSiteKey,
}: {
  id: string;
  mobile?: boolean;
  turnstileSiteKey?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  if (status === "success") {
    return (
      <p
        role="status"
        className={`m-0 ${mobile ? "text-[16px]" : "text-[15px]"} leading-[1.4] ${
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    if (turnstileToken) {
      formData.set("cf-turnstile-response", turnstileToken);
    }
    const result = await signupAction(formData);
    if (result.ok) {
      setStatus("success");
    } else {
      setErrorMsg(result.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col ${mobile ? "gap-2.5" : "gap-2"}`}
    >
      <label
        htmlFor={id}
        className="text-[12px] font-semibold tracking-[0.14em] uppercase"
      >
        Sign up to receive press releases
      </label>
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="!absolute !w-px !h-px !p-0 !m-[-1px] !overflow-hidden ![clip:rect(0,0,0,0)] !whitespace-nowrap !border-0"
      />
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
          {turnstileSiteKey && (
            <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-12 px-3 border-0 rounded-none bg-accent text-white font-sans text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer disabled:opacity-50 hover:bg-white hover:text-accent hover:outline hover:outline-1 hover:outline-accent"
          >
            {status === "loading" ? "Submitting…" : "Submit"}
          </button>
        </>
      ) : (
        <>
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
              disabled={status === "loading"}
              className="flex-none h-11 px-[18px] border-0 rounded-none bg-accent text-white font-sans text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer disabled:opacity-50 hover:bg-white hover:text-accent hover:outline hover:outline-1 hover:outline-accent"
            >
              {status === "loading" ? "Submitting…" : "Submit"}
            </button>
          </div>
          {turnstileSiteKey && (
            <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
          )}
        </>
      )}
      {status === "error" && (
        <p role="alert" className="m-0 text-[14px] text-danger">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

function DesktopHeader({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
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
          <SignupForm id="fc-list-email" turnstileSiteKey={turnstileSiteKey} />
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

function MobileHeader({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
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
          <SignupForm id="m-list-email" mobile turnstileSiteKey={turnstileSiteKey} />
        </div>
      )}
    </header>
  );
}

export default function SiteHeader({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  return (
    <>
      <DesktopHeader turnstileSiteKey={turnstileSiteKey} />
      <MobileHeader turnstileSiteKey={turnstileSiteKey} />
    </>
  );
}
