"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { href: "/admin", label: "Home" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/releases", label: "Releases" },
  { href: "/admin/coverage", label: "Coverage" },
  { href: "/admin/about", label: "About" },
];

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function getSectionLabel(pathname: string): string {
  for (const item of navItems) {
    if (isCurrent(pathname, item.href)) return item.label;
  }
  return "Admin";
}

export default function AdminMobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="md:hidden relative">
      <header className="flex items-center justify-between h-16 px-5 bg-ink text-white">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <img
              src="/fortune-creative-logo-white.png"
              alt="Fortune Creative"
              className="block w-[120px] h-auto"
            />
          </Link>
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-[#999]">
            {getSectionLabel(pathname)}
          </span>
        </div>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="w-11 h-11 flex items-center justify-center border-0 bg-transparent text-white cursor-pointer"
        >
          {open ? (
            <svg
              width="22"
              height="22"
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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          )}
        </button>
      </header>
      {open && (
        <nav
          aria-label="Admin navigation"
          className="absolute top-16 left-0 right-0 z-50 bg-ink border-t border-[#333] flex flex-col"
        >
          {navItems.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center min-h-[48px] px-5 no-underline text-[15px] border-b border-[#333] ${
                  current
                    ? "bg-white text-ink font-semibold"
                    : "text-[#E6E6E6]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center min-h-[48px] px-5 text-[#999] no-underline text-[14px]"
          >
            View live site
          </a>
        </nav>
      )}
    </div>
  );
}
