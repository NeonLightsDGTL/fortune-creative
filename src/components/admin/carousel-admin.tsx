"use client";

import { createClient } from "@/lib/supabase/client";
import { storageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

type Slide = {
  id: string;
  client_name: string;
  caption: string;
  url: string | null;
  image_path: string;
  position: number;
};

type FormState = {
  id?: string;
  client_name: string;
  caption: string;
  url: string;
  file: File | null;
};

const emptyForm: FormState = {
  client_name: "",
  caption: "",
  url: "",
  file: null,
};

export default function CarouselAdmin({
  initialSlides,
}: {
  initialSlides: Slide[];
}) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [undo, setUndo] = useState<{ slide: Slide; timer: NodeJS.Timeout } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const supabase = createClient();

  function startAdd() {
    setForm(emptyForm);
    setEditing(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(slide: Slide) {
    setForm({
      id: slide.id,
      client_name: slide.client_name,
      caption: slide.caption,
      url: slide.url ?? "",
      file: null,
    });
    setEditing(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let image_path = form.id
      ? slides.find((s) => s.id === form.id)?.image_path ?? ""
      : "";

    if (form.file) {
      const ext = form.file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("carousel")
        .upload(fileName, form.file);
      if (uploadErr) {
        alert("Upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      image_path = fileName;
    }

    if (form.id) {
      await supabase
        .from("carousel_slides")
        .update({
          client_name: form.client_name,
          caption: form.caption,
          url: form.url || null,
          image_path,
        })
        .eq("id", form.id);
    } else {
      if (!form.file) {
        alert("Please choose an image.");
        setSaving(false);
        return;
      }
      await supabase.from("carousel_slides").insert({
        client_name: form.client_name,
        caption: form.caption,
        url: form.url || null,
        image_path,
        position: 0,
      });
      // Push existing positions down
      for (let i = 0; i < slides.length; i++) {
        await supabase
          .from("carousel_slides")
          .update({ position: i + 1 })
          .eq("id", slides[i].id);
      }
    }

    setSaving(false);
    setEditing(false);
    setForm(emptyForm);
    router.refresh();
  }

  async function remove(slide: Slide) {
    setSlides((prev) => prev.filter((s) => s.id !== slide.id));
    const timer = setTimeout(async () => {
      await supabase.from("carousel_slides").delete().eq("id", slide.id);
      setUndo(null);
      router.refresh();
    }, 5000);
    if (undo) {
      clearTimeout(undo.timer);
      await supabase.from("carousel_slides").delete().eq("id", undo.slide.id);
    }
    setUndo({ slide, timer });
  }

  async function undoRemove() {
    if (!undo) return;
    clearTimeout(undo.timer);
    setSlides((prev) => {
      const next = [...prev, undo.slide];
      next.sort((a, b) => a.position - b.position);
      return next;
    });
    setUndo(null);
  }

  async function moveSlide(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((s, i) => (s.position = i));
    setSlides(next);
    for (const s of next) {
      await supabase
        .from("carousel_slides")
        .update({ position: s.position })
        .eq("id", s.id);
    }
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  async function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      return;
    }
    const next = [...slides];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    next.forEach((s, i) => (s.position = i));
    setSlides(next);
    setDragIdx(null);
    for (const s of next) {
      await supabase
        .from("carousel_slides")
        .update({ position: s.position })
        .eq("id", s.id);
    }
  }

  return (
    <div className="max-w-[1180px] flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-serif font-normal text-[44px] max-md:text-[32px] leading-none">
            Carousel
          </h1>
          <p className="m-0 text-[15px] text-secondary">
            These slides appear on the homepage. Drag to reorder, or use the
            arrows.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startAdd}
            className="min-h-[44px] px-5 border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer"
          >
            Add slide
          </button>
        )}
      </header>

      {undo && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border border-border text-[14px]"
        >
          <span>
            Removed <strong>{undo.slide.client_name}</strong>.
          </span>
          <button
            type="button"
            onClick={undoRemove}
            className="min-h-[36px] px-3 border border-ink bg-white text-ink text-[13px] font-semibold cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-7">
        {/* Slide list */}
        <div className="flex-[999_1_400px] min-w-0 flex flex-col border border-border bg-white">
          {slides.length === 0 && (
            <p className="p-6 text-center text-[15px] text-secondary">
              No slides yet. Add one to get started.
            </p>
          )}
          {slides.map((slide, idx) => {
            const thumbUrl = storageUrl("carousel", slide.image_path);
            return (
              <div
                key={slide.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={`flex items-center gap-4 max-md:gap-3 px-5 py-4 max-md:px-4 max-md:py-3 border-b border-rule-light ${
                  dragIdx === idx ? "opacity-50" : ""
                }`}
              >
                <span
                  className="cursor-grab text-secondary select-none max-md:hidden"
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </span>
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-[80px] max-md:w-[60px] aspect-[4/3] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[80px] max-md:w-[60px] aspect-[4/3] bg-placeholder flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[15px] font-semibold truncate">
                    {slide.client_name}
                  </p>
                  <p className="m-0 text-[13px] text-secondary truncate">
                    {slide.caption}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                    title="Move up"
                    className="w-9 h-9 flex items-center justify-center border border-border bg-white text-ink cursor-pointer disabled:opacity-30"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 19V5" />
                      <path d="M5 12l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, 1)}
                    disabled={idx === slides.length - 1}
                    aria-label="Move down"
                    title="Move down"
                    className="w-9 h-9 flex items-center justify-center border border-border bg-white text-ink cursor-pointer disabled:opacity-30"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M19 12l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(slide)}
                    aria-label={`Edit ${slide.client_name}`}
                    title="Edit"
                    className="w-9 h-9 flex items-center justify-center border border-border bg-white text-ink cursor-pointer"
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
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(slide)}
                    aria-label={`Remove ${slide.client_name}`}
                    title="Remove"
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit form */}
        {editing && (
          <form
            onSubmit={handleSave}
            className="flex-[1_1_320px] max-w-[420px] box-border p-6 bg-white border border-border flex flex-col gap-5 sticky top-6"
          >
            <h2 className="m-0 font-serif font-medium text-[22px]">
              {form.id ? "Edit slide" : "Add slide"}
            </h2>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cs-name"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Client name
              </label>
              <input
                id="cs-name"
                type="text"
                required
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
                className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cs-caption"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Caption
              </label>
              <input
                id="cs-caption"
                type="text"
                required
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cs-url"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Link (optional)
              </label>
              <input
                id="cs-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://"
                className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cs-image"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Image
              </label>
              <input
                ref={fileRef}
                id="cs-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] ?? null })
                }
                className="text-[14px]"
              />
              <p className="m-0 text-[13px] text-caption">
                Landscape, at least 1600 × 900 px.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[44px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving…" : form.id ? "Save changes" : "Add slide"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="min-h-[44px] px-4 border border-ink bg-white text-ink text-[14px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
