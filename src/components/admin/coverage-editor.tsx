"use client";

import { createClient } from "@/lib/supabase/client";
import { storageUrl, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import TagModal from "./tag-modal";

type Tag = { id: string; name: string };

type CoverageItem = {
  id: string;
  headline: string;
  outlet: string;
  url: string;
  published_date: string;
  tag_id: string | null;
  thumbnail_path: string | null;
  blurb: string;
  status: string;
  tags?: Tag | null;
};

export default function CoverageEditor({
  item,
  tags: initialTags,
}: {
  item?: CoverageItem;
  tags: Tag[];
}) {
  const [url, setUrl] = useState(item?.url ?? "");
  const [headline, setHeadline] = useState(item?.headline ?? "");
  const [outlet, setOutlet] = useState(item?.outlet ?? "");
  const [dateValue, setDateValue] = useState(
    item?.published_date ?? new Date().toISOString().split("T")[0]
  );
  const [tagId, setTagId] = useState(item?.tag_id ?? "");
  const [blurb, setBlurb] = useState(item?.blurb ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState(
    item
      ? item.status === "published"
        ? "Published"
        : "Draft, not published"
      : ""
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function reloadTags() {
    const { data } = await supabase
      .from("tags")
      .select("id, name")
      .eq("kind", "coverage")
      .order("name");
    if (data) setTags(data);
  }

  async function save(status: "draft" | "published") {
    if (!headline.trim() || !url.trim() || !outlet.trim()) {
      alert("Headline, outlet, and article URL are required.");
      return;
    }
    setSaving(true);

    let thumbnail_path = item?.thumbnail_path ?? null;
    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("coverage")
        .upload(fileName, file);
      if (uploadErr) {
        alert("Upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      thumbnail_path = fileName;
    }

    const payload = {
      headline,
      outlet,
      url,
      published_date: dateValue,
      tag_id: tagId || null,
      thumbnail_path,
      blurb,
      status,
    };

    if (item) {
      const { error } = await supabase
        .from("coverage")
        .update(payload)
        .eq("id", item.id);
      if (error) {
        alert("Save failed: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("coverage").insert(payload);
      if (error) {
        alert("Save failed: " + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setStatusText(
      status === "published" ? "Published to Coverage" : "Draft saved"
    );
    router.refresh();
    if (!item) router.push("/admin/coverage");
  }

  async function handleDelete() {
    if (!item) return;
    await supabase.from("coverage").delete().eq("id", item.id);
    router.push("/admin/coverage");
  }

  const selectedTag = tags.find((t) => t.id === tagId);
  const thumbUrl = item?.thumbnail_path
    ? storageUrl("coverage", item.thumbnail_path)
    : null;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save("published");
        }}
        className="max-w-[1180px] flex flex-col gap-7"
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <a
              href="/admin/coverage"
              className="text-[13px] text-secondary no-underline hover:text-accent"
            >
              ← All coverage
            </a>
            <h1 className="m-0 font-serif font-normal text-[44px] max-md:text-[32px] leading-none">
              {item ? "Edit Coverage" : "Add Coverage"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-[10px]">
            {statusText && (
              <span
                role="status"
                className="text-[14px] text-secondary mr-[6px]"
              >
                {statusText}
              </span>
            )}
            {item && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete this coverage"
                title="Delete"
                className="w-11 h-11 flex items-center justify-center border border-border bg-white text-danger cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 7h16" />
                  <path d="M9 7V4h6v3" />
                  <path d="M6 7l1 13h10l1-13" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => save("draft")}
              disabled={saving}
              className="min-h-[44px] px-[18px] border border-ink bg-white text-ink text-[14px] font-semibold cursor-pointer disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-[22px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </header>

        {confirmDelete && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-[10px] px-[18px] py-[14px] bg-danger-tint border border-[#E8C9CE]"
          >
            <p className="m-0 flex-[1_1_240px] text-[14px] leading-[1.45]">
              Delete this coverage post? It will be removed from the website.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[44px] px-4 border-0 bg-danger text-white text-[14px] font-semibold cursor-pointer"
            >
              Delete coverage
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="min-h-[44px] px-4 border border-ink bg-white text-ink text-[14px] cursor-pointer"
            >
              Keep
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-7">
          <div className="flex-[999_1_520px] min-w-0 box-border p-7 max-md:p-5 bg-white border border-border flex flex-col gap-[22px]">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="v-url"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Link to the article
              </label>
              <input
                id="v-url"
                type="url"
                required
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-[48px] px-[14px] border border-ink text-[16px] bg-white text-ink focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
              <p className="m-0 text-[13px] text-caption">
                The Read full coverage button sends visitors here, in a new tab.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="v-head"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Headline
              </label>
              <input
                id="v-head"
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="h-[52px] px-[14px] border border-ink font-serif text-[22px] bg-white text-ink focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
              <p className="m-0 text-[13px] text-caption">
                Use the headline as the outlet published it.
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="flex-[1_1_200px] flex flex-col gap-2">
                <label
                  htmlFor="v-outlet"
                  className="text-[12px] font-semibold tracking-[0.14em] uppercase flex items-center min-h-[32px]"
                >
                  Outlet
                </label>
                <input
                  id="v-outlet"
                  type="text"
                  required
                  value={outlet}
                  onChange={(e) => setOutlet(e.target.value)}
                  className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
                />
              </div>
              <div className="flex-[1_1_160px] flex flex-col gap-2">
                <label
                  htmlFor="v-date"
                  className="text-[12px] font-semibold tracking-[0.14em] uppercase flex items-center min-h-[32px]"
                >
                  Date published
                </label>
                <input
                  id="v-date"
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
                />
              </div>
              <div className="flex-[1_1_160px] flex flex-col gap-2">
                <div className="flex justify-between items-center min-h-[32px] gap-3">
                  <label
                    htmlFor="v-tag"
                    className="text-[12px] font-semibold tracking-[0.14em] uppercase"
                  >
                    Tag
                  </label>
                  <button
                    type="button"
                    onClick={() => setTagsOpen(true)}
                    className="min-h-[32px] p-0 border-0 bg-transparent text-secondary text-[13px] underline cursor-pointer"
                  >
                    Manage tags
                  </button>
                </div>
                <select
                  id="v-tag"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
                >
                  <option value="">No tag</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="v-thumb"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Thumbnail image
              </label>
              {thumbUrl && !file && (
                <img
                  src={thumbUrl}
                  alt=""
                  className="w-full max-w-[400px] aspect-[4/3] object-cover"
                />
              )}
              <input
                ref={fileRef}
                id="v-thumb"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-[14px] text-secondary file:mr-3 file:py-2 file:px-4 file:border file:border-ink file:bg-white file:text-ink file:text-[13px] file:font-semibold file:cursor-pointer file:rounded-none"
              />
              <p className="m-0 text-[13px] text-caption">
                Landscape, at least 1600 × 1200 px.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline gap-3">
                <label
                  htmlFor="v-blurb"
                  className="text-[12px] font-semibold tracking-[0.14em] uppercase"
                >
                  Short blurb
                </label>
                <span className="text-[13px] text-caption tabular-nums">
                  {blurb.length} / 240
                </span>
              </div>
              <textarea
                id="v-blurb"
                rows={3}
                maxLength={240}
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                className="px-[14px] py-3 border border-ink text-[15px] leading-[1.5] bg-white resize-y focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
          </div>

          <aside
            aria-label="Preview"
            className="flex-[1_1_320px] max-w-[420px] flex flex-col gap-[14px] sticky top-6"
          >
            <p className="m-0 text-[12px] font-semibold tracking-[0.14em] uppercase text-secondary">
              How it appears on Coverage
            </p>
            <div className="bg-white border border-border p-5 flex flex-col gap-3">
              <div className="aspect-[4/3] w-full bg-placeholder" />
              <p className="m-0 flex flex-wrap gap-[6px_12px] text-[11px] font-semibold tracking-[0.14em] uppercase">
                {selectedTag && (
                  <span className="text-accent">{selectedTag.name}</span>
                )}
                <span className="text-secondary">
                  {dateValue ? formatDate(dateValue) : "Date"}
                </span>
              </p>
              <p className="m-0 font-serif italic text-[16px]">
                {outlet || "Outlet name"}
              </p>
              <p className="m-0 font-serif font-medium text-[22px] leading-[1.2]">
                {headline || "Headline appears here"}
              </p>
              <p className="m-0 text-[14px] leading-[1.5] text-secondary">
                {blurb || "Your short blurb appears here."}
              </p>
              <span className="self-start inline-flex items-center min-h-[36px] px-[14px] border border-ink text-[11px] font-semibold tracking-[0.14em] uppercase">
                Read full coverage
              </span>
              <p className="m-0 text-[12px] text-caption break-all">
                Goes to: {url || "no link yet"}
              </p>
            </div>
          </aside>
        </div>
      </form>

      {tagsOpen && (
        <TagModal
          kind="coverage"
          onClose={() => setTagsOpen(false)}
          onTagsChanged={reloadTags}
        />
      )}
    </>
  );
}
