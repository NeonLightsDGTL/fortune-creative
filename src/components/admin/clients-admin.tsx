"use client";

import { createClient } from "@/lib/supabase/client";
import { storageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

type Client = {
  id: string;
  name: string;
  url: string;
  image_path: string;
  position: number;
};

type FormState = {
  id?: string;
  name: string;
  url: string;
  file: File | null;
};

const emptyForm: FormState = { name: "", url: "", file: null };

export default function ClientsAdmin({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [undo, setUndo] = useState<{
    client: Client;
    timer: NodeJS.Timeout;
  } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function startAdd() {
    setForm(emptyForm);
    setEditing(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(client: Client) {
    setForm({
      id: client.id,
      name: client.name,
      url: client.url,
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
      ? clients.find((c) => c.id === form.id)?.image_path ?? ""
      : "";

    if (form.file) {
      const ext = form.file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("clients")
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
        .from("clients")
        .update({ name: form.name, url: form.url, image_path })
        .eq("id", form.id);
    } else {
      if (!form.file) {
        alert("Please choose an image.");
        setSaving(false);
        return;
      }
      // New clients go to the top (position 0), push others down
      for (let i = 0; i < clients.length; i++) {
        await supabase
          .from("clients")
          .update({ position: i + 1 })
          .eq("id", clients[i].id);
      }
      await supabase.from("clients").insert({
        name: form.name,
        url: form.url,
        image_path,
        position: 0,
      });
    }

    setSaving(false);
    setEditing(false);
    setForm(emptyForm);
    router.refresh();
  }

  async function remove(client: Client) {
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    const timer = setTimeout(async () => {
      await supabase.from("clients").delete().eq("id", client.id);
      setUndo(null);
      router.refresh();
    }, 5000);
    if (undo) {
      clearTimeout(undo.timer);
      await supabase.from("clients").delete().eq("id", undo.client.id);
    }
    setUndo({ client, timer });
  }

  async function undoRemove() {
    if (!undo) return;
    clearTimeout(undo.timer);
    setClients((prev) => {
      const next = [...prev, undo.client];
      next.sort((a, b) => a.position - b.position);
      return next;
    });
    setUndo(null);
  }

  async function moveClient(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= clients.length) return;
    const next = [...clients];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((c, i) => (c.position = i));
    setClients(next);
    for (const c of next) {
      await supabase
        .from("clients")
        .update({ position: c.position })
        .eq("id", c.id);
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
    const next = [...clients];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    next.forEach((c, i) => (c.position = i));
    setClients(next);
    setDragIdx(null);
    for (const c of next) {
      await supabase
        .from("clients")
        .update({ position: c.position })
        .eq("id", c.id);
    }
  }

  return (
    <div className="max-w-[1180px] flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-serif font-normal text-[44px] max-md:text-[32px] leading-none">
            Clients
          </h1>
          <p className="m-0 text-[15px] text-secondary">
            Drag to reorder. New clients appear at the top.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startAdd}
            className="min-h-[44px] px-5 border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer"
          >
            Add client
          </button>
        )}
      </header>

      {undo && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border border-border text-[14px]"
        >
          <span>
            Removed <strong>{undo.client.name}</strong>.
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
        <div className="flex-[999_1_400px] min-w-0 flex flex-col border border-border bg-white">
          {clients.length === 0 && (
            <p className="p-6 text-center text-[15px] text-secondary">
              No clients yet.
            </p>
          )}
          {clients.map((client, idx) => {
            const thumbUrl = storageUrl("clients", client.image_path);
            return (
              <div
                key={client.id}
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
                    className="w-[60px] aspect-square object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[60px] aspect-square bg-placeholder flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[15px] font-semibold truncate">
                    {client.name}
                  </p>
                  <p className="m-0 text-[13px] text-secondary truncate">
                    {client.url}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveClient(idx, -1)}
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
                    onClick={() => moveClient(idx, 1)}
                    disabled={idx === clients.length - 1}
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
                    onClick={() => startEdit(client)}
                    aria-label={`Edit ${client.name}`}
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
                    onClick={() => remove(client)}
                    aria-label={`Remove ${client.name}`}
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

        {editing && (
          <form
            onSubmit={handleSave}
            className="flex-[1_1_320px] max-w-[420px] box-border p-6 bg-white border border-border flex flex-col gap-5 sticky top-6"
          >
            <h2 className="m-0 font-serif font-medium text-[22px]">
              {form.id ? "Edit client" : "Add client"}
            </h2>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cl-name"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Name
              </label>
              <input
                id="cl-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cl-url"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Website URL
              </label>
              <input
                id="cl-url"
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://"
                className="h-[44px] px-3 border border-ink text-[15px] bg-white focus:outline-2 focus:outline-accent focus:outline-offset-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cl-image"
                className="text-[12px] font-semibold tracking-[0.14em] uppercase"
              >
                Photo
              </label>
              <input
                ref={fileRef}
                id="cl-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] ?? null })
                }
                className="text-[14px]"
              />
              <p className="m-0 text-[13px] text-caption">
                Square, at least 800 × 800 px.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[44px] border-0 bg-ink text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : form.id
                    ? "Save changes"
                    : "Add client"}
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
