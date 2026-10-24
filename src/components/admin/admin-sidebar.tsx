"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <nav
      aria-label="Admin"
      className="hidden md:flex flex-[1_1_220px] max-w-[260px] box-border p-6 px-4 bg-ink text-white flex-col gap-7 min-h-svh sticky top-0"
    >
      <Link href="/admin">
        <img
          src="/fortune-creative-logo-white.png"
          alt="Fortune Creative"
          className="block w-[180px] h-auto"
        />
      </Link>
      <ul className="list-none m-0 p-0 flex flex-col gap-1">
        {navItems.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center min-h-[44px] px-3 no-underline text-[15px] ${
                  current
                    ? "bg-white text-ink font-semibold"
                    : "text-[#E6E6E6] hover:text-white hover:bg-[#2A2A2A]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center min-h-[44px] px-3 text-[#E6E6E6] no-underline text-[14px] hover:text-white hover:bg-[#2A2A2A]"
        >
          View live site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center min-h-[44px] px-3 text-[#999] bg-transparent border-0 text-[14px] cursor-pointer hover:text-white hover:bg-[#2A2A2A] text-left"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
