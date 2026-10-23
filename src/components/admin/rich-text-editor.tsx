"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export default function RichTextEditor({
  content,
  onChange,
  labelId,
  minHeight = "400px",
}: {
  content: string;
  onChange: (html: string) => void;
  labelId?: string;
  minHeight?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function insertLink() {
    const url = prompt("URL:");
    if (!url) return;
    editor!
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  function insertImage() {
    const url = prompt("Image URL:");
    if (!url) return;
    editor!.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-col gap-0">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap gap-1 p-[6px] border border-ink border-b-0 bg-admin-bg"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
          className={`w-11 h-10 border-0 bg-transparent cursor-pointer font-sans text-[15px] font-bold hover:bg-ink hover:text-white ${
            editor.isActive("bold") ? "bg-ink text-white" : ""
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
          className={`w-11 h-10 border-0 bg-transparent cursor-pointer font-serif text-[17px] italic hover:bg-ink hover:text-white ${
            editor.isActive("italic") ? "bg-ink text-white" : ""
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading"
          className={`w-11 h-10 border-0 bg-transparent cursor-pointer font-sans text-[14px] font-bold hover:bg-ink hover:text-white ${
            editor.isActive("heading", { level: 2 }) ? "bg-ink text-white" : ""
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
          className={`w-11 h-10 border-0 bg-transparent cursor-pointer hover:bg-ink hover:text-white ${
            editor.isActive("blockquote") ? "bg-ink text-white" : ""
          }`}
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
            <path d="M3 21c3-1 6-5 6-10V4H3v7h6" />
            <path d="M15 21c3-1 6-5 6-10V4h-6v7h6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={insertLink}
          aria-label="Insert link"
          className={`w-11 h-10 border-0 bg-transparent cursor-pointer hover:bg-ink hover:text-white ${
            editor.isActive("link") ? "bg-ink text-white" : ""
          }`}
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
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={insertImage}
          aria-label="Insert image"
          className="w-11 h-10 border-0 bg-transparent cursor-pointer hover:bg-ink hover:text-white"
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
            <rect x="3" y="3" width="18" height="18" rx="0" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>
      </div>
      <EditorContent
        editor={editor}
        aria-labelledby={labelId}
        className="border border-ink bg-white font-serif text-[18px] leading-[1.6] text-ink [&_.tiptap]:p-4 [&_.tiptap]:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
