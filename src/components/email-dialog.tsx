"use client";

import { useState, useEffect, useRef } from "react";

export default function EmailDialog() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = project.trim();
    if (!name) return;
    const subject = encodeURIComponent("NEW BUSINESS INQUIRY: " + name);
    setOpen(false);
    setProject("");
    window.location.href = "mailto:dan@fortunecreative.com?subject=" + subject;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[10px] self-start min-h-[48px] px-6 border-0 bg-ink text-white font-sans text-[13px] font-semibold tracking-[0.14em] uppercase cursor-pointer"
      >
        Email me
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 p-4 bg-black/55 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="em-title"
            className="w-full max-w-[480px] p-7 bg-white border border-ink shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[18px]"
            >
              <h2
                id="em-title"
                className="m-0 font-serif font-normal text-[28px] leading-[1.15]"
              >
                What project is this about?
              </h2>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="em-project"
                  className="text-[12px] font-semibold tracking-[0.14em] uppercase"
                >
                  Project name
                </label>
                <input
                  ref={inputRef}
                  id="em-project"
                  type="text"
                  required
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Show, album, or event"
                  className="h-12 px-3 border border-ink bg-white text-ink font-sans text-[16px] focus:outline-2 focus:outline-accent focus:outline-offset-1"
                />
                <p className="m-0 text-[13px] leading-[1.45] text-caption">
                  Your email app will open with a message to Dan, subject: NEW
                  BUSINESS INQUIRY: {project.trim() || "[your project]"}
                </p>
              </div>
              <div className="flex flex-wrap gap-[10px]">
                <button
                  type="submit"
                  className="flex-[1_1_auto] min-h-[48px] px-[22px] border-0 bg-ink text-white font-sans text-[13px] font-semibold tracking-[0.14em] uppercase cursor-pointer"
                >
                  Open email
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-[0_0_auto] min-h-[48px] px-[22px] border border-ink bg-white text-ink font-sans text-[13px] font-semibold tracking-[0.14em] uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
