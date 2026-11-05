"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function TaglineAdmin({
  initialTagline,
}: {
  initialTagline: string;
}) {
  const [tagline, setTagline] = useState(initialTagline);
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [dirty, setDirty] = useState(false);
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("site_settings")
      .update({ tagline })
      .eq("id", 1);

    setSaving(false);

    if (error) {
      alert("Save failed: " + error.message);
      return;
    }

    setDirty(false);
    setStatusText("Saved.");
  }

  return (
    <form
      onSubmit={handleSave}
      className="max-w-[1180px] p-6 bg-white border border-border flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-serif font-normal text-[28px] max-md:text-[22px] leading-none">
            Tagline
          </h2>
          <p className="m-0 text-[14px] text-secondary">
            The headline shown on the public home page above the carousel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {statusText && (
            <span role="status" className="text-[14px] text-secondary">
              {statusText}
            </span>
          )}
          <button
            type="submit"
            disabled={saving || !dirty}
            className="min-h-[44px] px-[22px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save tagline"}
          </button>
        </div>
      </div>
      <textarea
        value={tagline}
        onChange={(e) => {
          setTagline(e.target.value);
          setDirty(true);
          setStatusText("");
        }}
        rows={3}
        className="w-full px-3 py-3 border border-ink text-[16px] font-serif leading-[1.5] bg-white text-ink resize-y focus:outline-2 focus:outline-accent focus:outline-offset-1"
      />
    </form>
  );
}
