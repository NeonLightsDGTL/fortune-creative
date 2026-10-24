"use client";

import { createClient } from "@/lib/supabase/client";
import { storageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
});

export default function AboutAdmin({
  initialPhotoPath,
  initialCredit,
  initialBio,
}: {
  initialPhotoPath: string | null;
  initialCredit: string;
  initialBio: string;
}) {
  const [credit, setCredit] = useState(initialCredit);
  const [bio, setBio] = useState(initialBio);
  const [file, setFile] = useState<File | null>(null);
  const [photoPath, setPhotoPath] = useState(initialPhotoPath);
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState("All changes saved");
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const photoUrl = photoPath ? storageUrl("about", photoPath) : null;

  function markDirty() {
    if (!dirty) {
      setDirty(true);
      setStatusText("Unsaved changes");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let photo_path = photoPath;
    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `about-photo.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("about")
        .upload(fileName, file, { upsert: true });
      if (uploadErr) {
        alert("Upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      photo_path = fileName;
    }

    const { error } = await supabase
      .from("about")
      .update({
        photo_path,
        photo_credit: credit,
        bio,
      })
      .eq("id", 1);

    if (error) {
      alert("Save failed: " + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setDirty(false);
    setPhotoPath(photo_path);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatusText("Saved. The About page is updated.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSave}
      className="max-w-[1180px] flex flex-col gap-7"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-serif font-normal text-[44px] max-md:text-[32px] leading-none">
            About
          </h1>
          <p className="m-0 text-[15px] text-secondary">
            Dan&apos;s photo, photo credit, and bio on the About page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <span role="status" className="text-[14px] text-secondary mr-[6px]">
            {statusText}
          </span>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-[44px] px-[18px] border border-ink text-ink no-underline text-[14px] font-semibold"
          >
            View page
          </a>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-[22px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-7">
        <div className="flex-[1_1_300px] max-w-[380px] box-border p-6 bg-white border border-border flex flex-col gap-[22px]">
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[12px] font-semibold tracking-[0.14em] uppercase">
              Photo
            </p>
            {photoUrl && !file ? (
              <img
                src={photoUrl}
                alt="Current photo"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-placeholder flex items-center justify-center text-caption text-[11px] font-semibold tracking-[0.14em] uppercase">
                Current photo
              </div>
            )}
            <label
              htmlFor="ab-photo"
              className="text-[14px] font-semibold"
            >
              Replace photo
            </label>
            <input
              ref={fileRef}
              id="ab-photo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                markDirty();
              }}
              className="text-[14px] text-secondary file:mr-3 file:py-2 file:px-4 file:border file:border-ink file:bg-white file:text-ink file:text-[13px] file:font-semibold file:cursor-pointer file:rounded-none"
            />
            <p className="m-0 text-[13px] leading-[1.45] text-caption">
              Portrait (taller than wide), at least 1200 × 1500 px.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="ab-photo-credit"
              className="text-[12px] font-semibold tracking-[0.14em] uppercase"
            >
              Photo credit
            </label>
            <input
              id="ab-photo-credit"
              type="text"
              value={credit}
              onChange={(e) => {
                setCredit(e.target.value);
                markDirty();
              }}
              placeholder="Photo by…"
              className="h-[44px] px-3 border border-ink text-[15px] bg-white text-ink focus:outline-2 focus:outline-accent focus:outline-offset-1"
            />
          </div>
        </div>

        <div className="flex-[999_1_520px] min-w-0 box-border p-7 bg-white border border-border">
          <div className="flex flex-col gap-2">
            <p
              id="ab-bio-label"
              className="m-0 text-[12px] font-semibold tracking-[0.14em] uppercase"
            >
              Bio
            </p>
            <RichTextEditor
              content={bio}
              onChange={(html) => {
                setBio(html);
                markDirty();
              }}
              labelId="ab-bio-label"
              minHeight="600px"
            />
            <p className="m-0 text-[13px] leading-[1.45] text-caption">
              Use Italic for show titles. The first mention of Dan&apos;s name
              is bold.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
