"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";

type Tag = {
  id: string;
  kind: string;
  name: string;
  count: number;
};

export default function TagModal({
  kind,
  onClose,
  onTagsChanged,
}: {
  kind: "release" | "coverage";
  onClose: () => void;
  onTagsChanged: () => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const table = kind === "release" ? "releases" : "coverage";
  const noun = kind === "coverage" ? "coverage post" : "release";
  const plural = kind === "coverage" ? "coverage posts" : "releases";

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    const { data: allTags } = await supabase
      .from("tags")
      .select("*")
      .eq("kind", kind)
      .order("name");

    if (!allTags) return;

    const withCounts = await Promise.all(
      allTags.map(async (t) => {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .eq("tag_id", t.id);
        return { ...t, count: count ?? 0 };
      })
    );
    setTags(withCounts);
  }

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setStatus(`${name} already exists.`);
      return;
    }
    const { error } = await supabase
      .from("tags")
      .insert({ kind, name });
    if (error) {
      setStatus("Error adding tag.");
      return;
    }
    setDraft("");
    setStatus(`Added ${name}.`);
    onTagsChanged();
    await loadTags();
  }

  async function saveRename(tagId: string, oldName: string) {
    const name = editValue.trim();
    if (!name) return;
    const { error } = await supabase
      .from("tags")
      .update({ name })
      .eq("id", tagId);
    if (error) {
      setStatus("Error renaming tag.");
      return;
    }
    setEditId(null);
    setStatus(`Renamed ${oldName} to ${name}.`);
    onTagsChanged();
    await loadTags();
  }

  async function deleteTag(tag: Tag) {
    await supabase.from("tags").delete().eq("id", tag.id);
    setConfirmId(null);
    setStatus(`Deleted ${tag.name}.`);
    onTagsChanged();
    await loadTags();
  }

  function cancel() {
    setEditId(null);
    setConfirmId(null);
  }

  return (
    <div className="fixed inset-0 z-50 p-4 bg-[rgba(17,17,17,0.55)] flex items-center justify-center">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tm-title"
        className="w-full max-w-[560px] max-h-full flex flex-col bg-white border border-ink shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-[18px] border-b border-border">
          <h2
            id="tm-title"
            className="m-0 font-serif font-medium text-[26px]"
          >
            {kind === "coverage" ? "Coverage Tags" : "Release Tags"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center border-0 bg-transparent text-ink cursor-pointer"
          >
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
          </button>
        </div>

        <div className="px-5 py-[18px] border-b border-border flex flex-col gap-[10px]">
          <p className="m-0 text-[14px] leading-[1.45] text-secondary">
            These are the choices in the Tag menu. Renaming a tag updates every{" "}
            {noun} that uses it.
          </p>
          <form onSubmit={addTag} className="flex gap-2">
            <label htmlFor="tm-new" className="sr-only">
              New tag name
            </label>
            <input
              id="tm-new"
              type="text"
              placeholder="New tag name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 min-w-0 h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
            />
            <button
              type="submit"
              className="h-[44px] px-[18px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer"
            >
              Add tag
            </button>
          </form>
          {status && (
            <p role="status" className="m-0 text-[13px] text-ink">
              {status}
            </p>
          )}
        </div>

        <ul className="list-none m-0 p-0 overflow-y-auto flex-1">
          {tags.map((tag) => {
            const isEditing = editId === tag.id;
            const isConfirming = confirmId === tag.id;

            if (isEditing) {
              return (
                <li key={tag.id} className="border-b border-rule-light">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename(tag.id, tag.name);
                    }}
                    className="flex items-center gap-2 px-5 py-2 bg-[#FAFAF8]"
                  >
                    <label htmlFor={`tm-ren-${tag.id}`} className="sr-only">
                      Rename {tag.name}
                    </label>
                    <input
                      id={`tm-ren-${tag.id}`}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="flex-1 min-w-0 h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
                    />
                    <button
                      type="submit"
                      className="h-[44px] px-[14px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="h-[44px] px-[14px] border border-ink bg-white text-ink text-[14px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                </li>
              );
            }

            if (isConfirming) {
              return (
                <li key={tag.id} className="border-b border-rule-light">
                  <div
                    role="alert"
                    className="flex flex-wrap items-center gap-[10px] px-5 py-3 bg-danger-tint"
                  >
                    <p className="m-0 flex-[1_1_200px] text-[14px] leading-[1.45]">
                      {tag.name} is used on {tag.count}{" "}
                      {tag.count === 1 ? noun : plural}. Those will show no tag
                      until you pick a new one.
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteTag(tag)}
                      className="h-[44px] px-[14px] border-0 bg-danger text-white text-[14px] font-semibold cursor-pointer"
                    >
                      Delete tag
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="h-[44px] px-[14px] border border-ink bg-white text-ink text-[14px] cursor-pointer"
                    >
                      Keep
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={tag.id} className="border-b border-rule-light">
                <div className="flex items-center gap-2 px-5 py-2">
                  <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
                    <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-accent">
                      {tag.name}
                    </span>
                    <span className="text-[13px] text-caption">
                      {tag.count === 0
                        ? "Not used yet"
                        : `Used on ${tag.count} ${tag.count === 1 ? noun : plural}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(tag.id);
                      setEditValue(tag.name);
                      setConfirmId(null);
                      setStatus("");
                    }}
                    aria-label={`Rename ${tag.name}`}
                    title="Rename"
                    className="w-11 h-11 flex items-center justify-center border border-border bg-white text-ink cursor-pointer"
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
                      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tag.count === 0) {
                        deleteTag(tag);
                      } else {
                        setConfirmId(tag.id);
                        setEditId(null);
                        setStatus("");
                      }
                    }}
                    aria-label={`Delete ${tag.name}`}
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
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-[22px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
