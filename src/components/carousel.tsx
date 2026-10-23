"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Slide {
  id: string;
  client_name: string;
  caption: string | null;
  url: string | null;
  image_url: string | null;
}

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchRef = useRef<number | null>(null);
  const total = slides.length;

  const go = useCallback(
    (i: number) => setIdx(((i % total) + total) % total),
    [total]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setPaused(true);
      return;
    }
  }, []);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  if (total === 0) return null;
  const cur = slides[idx];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured clients"
      className="flex flex-col gap-[14px] max-md:gap-[10px]"
    >
      {/* Slide area */}
      <div
        className="relative w-full aspect-[2/1] max-md:aspect-[4/3] max-md:mx-[-20px] max-md:w-[calc(100%+40px)] min-h-[320px] max-md:min-h-0 overflow-hidden"
        onTouchStart={(e) => {
          touchRef.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (touchRef.current == null || !t) return;
          const dx = t.clientX - touchRef.current;
          touchRef.current = null;
          if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        }}
      >
        {cur.image_url ? (
          <Image
            src={cur.image_url}
            alt={`${cur.client_name}${cur.caption ? `, ${cur.caption}` : ""}`}
            fill
            className="object-cover"
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${total}`}
          />
        ) : (
          <div
            className="absolute inset-0 bg-placeholder flex items-center justify-center text-caption text-[12px] max-md:text-[11px] font-semibold tracking-[0.14em] uppercase"
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${total}`}
          >
            Featured image {idx + 1} of {total}
          </div>
        )}
      </div>

      {/* Caption + controls */}
      <div className="flex flex-wrap max-md:flex-col items-center max-md:items-stretch gap-x-8 gap-y-3 pb-4 max-md:pb-3 border-b border-ink">
        <p aria-live="polite" className="m-0 text-[15px] max-md:text-[14px] leading-[1.4]">
          {cur.url ? (
            <a
              href={cur.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink font-semibold no-underline"
            >
              {cur.client_name}
            </a>
          ) : (
            <span className="font-semibold">{cur.client_name}</span>
          )}
          {cur.caption && (
            <span className="text-secondary">, {cur.caption}</span>
          )}
        </p>

        <div className="flex items-center gap-2 max-md:justify-between ml-auto max-md:ml-0">
          {/* Dots */}
          <div className="flex items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === idx ? "true" : undefined}
                onClick={() => go(i)}
                className="w-8 max-md:w-[30px] h-11 flex items-center justify-center border-0 bg-transparent cursor-pointer"
              >
                <span
                  className={`w-5 max-md:w-[18px] h-[3px] ${
                    i === idx ? "bg-ink" : "bg-[#BDBDB8]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2 max-md:gap-[6px]">
            {/* Previous */}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(idx - 1)}
              className="w-11 h-11 flex items-center justify-center border border-ink bg-white text-ink cursor-pointer hover:bg-ink hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            {/* Next */}
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(idx + 1)}
              className="w-11 h-11 flex items-center justify-center border border-ink bg-white text-ink cursor-pointer hover:bg-ink hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setPaused(!paused)}
              className="w-11 h-11 flex items-center justify-center border border-ink bg-white text-ink cursor-pointer hover:bg-ink hover:text-white"
            >
              {paused ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 4l14 8-14 8z" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="5" y="4" width="5" height="16" />
                  <rect x="14" y="4" width="5" height="16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
