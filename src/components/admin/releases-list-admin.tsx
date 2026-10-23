"use client";

import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Release = {
  id: string;
  slug: string;
  headline: string;
  release_date: string;
  status: string;
  tags: { name: string } | null;
};

type Filter = "all" | "published" | "draft";

export default function ReleasesListAdmin({
  initialReleases,
}: {
  initialReleases: Release[];
}) {
  const [releases, setReleases] = useState(initialReleases);
  const [filter, setFilter] = useState<Filter>("all");
  const [undo, setUndo] = useState<{
    release: Release;
    timer: NodeJS.Timeout;
  } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const filtered = releases.filter((r) => {
    if (filter === "published") return r.status === "published";
    if (filter === "draft") return r.status === "draft";
    return true;
  });

  const counts = {
    all: releases.length,
    published: releases.filter((r) => r.status === "published").length,
    draft: releases.filter((r) => r.status === "draft").length,
  };

  async function deleteRelease(release: Release) {
    setConfirmId(null);
    setReleases((prev) => prev.filter((r) => r.id !== release.id));
    const timer = setTimeout(async () => {
      await supabase.from("releases").delete().eq("id", release.id);
      setUndo(null);
      router.refresh();
    }, 5000);
    if (undo) {
      clearTimeout(undo.timer);
      await supabase.from("releases").delete().eq("id", undo.release.id);
    }
    setUndo({ release, timer });
  }

  async function undoDelete() {
    if (!undo) return;
    clearTimeout(undo.timer);
    setReleases((prev) => {
      const next = [...prev, undo.release];
      next.sort(
        (a, b) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      );
      return next;
    });
    setUndo(null);
  }

  return (
    <div className="max-w-[1180px] flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-serif font-normal text-[44px] max-md:text-[32px] leading-none">
          Releases
        </h1>
        <Link
          href="/admin/releases/new"
          className="min-h-[44px] px-5 inline-flex items-center border-0 bg-ink text-white text-[14px] font-semibold no-underline"
        >
          New release
        </Link>
      </header>

      <div className="flex flex-wrap gap-1 text-[13px] font-semibold tracking-[0.14em] uppercase">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-[40px] px-4 border cursor-pointer ${
              filter === f
                ? "border-ink bg-ink text-white"
                : "border-border bg-white text-ink"
            }`}
          >
            {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}{" "}
            <span className="font-normal">({counts[f]})</span>
          </button>
        ))}
      </div>

      {undo && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border border-border text-[14px]"
        >
          <span>
            Deleted <strong>{undo.release.headline}</strong>.
          </span>
          <button
            type="button"
            onClick={undoDelete}
            className="min-h-[36px] px-3 border border-ink bg-white text-ink text-[13px] font-semibold cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      <div className="bg-white border border-border">
        {filtered.length === 0 && (
          <p className="p-6 text-center text-[15px] text-secondary">
            No releases found.
          </p>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 max-md:px-4 max-md:py-3 border-b border-rule-light"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Link
                href={`/admin/releases/${r.id}`}
                className="m-0 text-[15px] font-semibold text-ink no-underline hover:text-accent truncate"
              >
                {r.headline}
              </Link>
              <p className="m-0 text-[13px] text-secondary flex flex-wrap gap-x-3">
                <span>{formatDate(r.release_date)}</span>
                {r.tags && (
                  <span className="text-accent">{r.tags.name}</span>
                )}
                <span
                  className={
                    r.status === "published" ? "text-ink" : "text-caption"
                  }
                >
                  {r.status === "published" ? "Published" : "Draft"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/admin/releases/${r.id}`}
                aria-label={`Edit ${r.headline}`}
                title="Edit"
                className="w-9 h-9 flex items-center justify-center border border-border bg-white text-ink"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                  <path d="M13.5 6.5l4 4" />
                </svg>
              </Link>
              {r.status === "published" && (
                <a
                  href={`/releases/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${r.headline}`}
                  title="View on site"
                  className="w-9 h-9 flex items-center justify-center border border-border bg-white text-ink"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </a>
              )}
              {confirmId === r.id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => deleteRelease(r)}
                    className="h-9 px-3 border-0 bg-danger text-white text-[12px] font-semibold cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="h-9 px-3 border border-ink bg-white text-ink text-[12px] cursor-pointer"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(r.id)}
                  aria-label={`Delete ${r.headline}`}
                  title="Delete"
                  className="w-9 h-9 flex items-center justify-center border border-border bg-white text-danger cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M9 7V4h6v3" />
                    <path d="M6 7l1 13h10l1-13" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
