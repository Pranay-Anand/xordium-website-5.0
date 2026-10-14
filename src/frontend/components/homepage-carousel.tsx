"use client";

import { useEffect, useRef, useState } from "react";

type CarouselImage = {
  id: string;
  altText: string;
  sourceName: string;
};

const ROTATION_INTERVAL_MS = 6_000; // 6 seconds per slide for smooth slow rotation

export default function HomepageCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [width, setWidth] = useState(0);
  const [slide, setSlide] = useState(0);

  // Fetch images from git folder (committed to repo)
  useEffect(() => {
    fetch("/api/git-carousel")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: CarouselImage[]) => setImages(Array.isArray(data) ? data : []))
      .catch(() => setImages([]));
  }, []);

  // Update width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      setWidth(viewportRef.current?.clientWidth ?? 0);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Smooth continuous rotation
  useEffect(() => {
    if (images.length < 2) return;

    // Start the rotation interval
    const interval = setInterval(() => {
      setSlide((current) => current + 1);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [images.length]);

  // Reset slide position when it exceeds image count, with smooth transition
  useEffect(() => {
    if (images.length && slide >= images.length) {
      const reset = setTimeout(() => setSlide(0), 700);
      return () => clearTimeout(reset);
    }
  }, [images.length, slide]);

  if (images.length === 0) return null;

  // Calculate slide width: 4 images on desktop (25% each), 1.5 on mobile (66.67% each)
  const isDesktop = width >= 1024;
  const imagesPerRow = isDesktop ? 4 : 1.5;
  const slideWidth = isDesktop
    ? width / 4
    : width / 1.5; // 1.5 images width per slide

  // Render cloned images for continuous looping (double the array so carousel never ends)
  const renderedImages = images.length > 1 ? [...images, ...images] : images;

  return (
    <section className="border-y border-white/10 bg-[#0d0f14]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div ref={viewportRef} className="overflow-hidden border border-white/10 bg-[#101218]">
          <div
            className="flex"
            style={{
              // Always apply transition for smooth rotation
              transition: "transform 700ms ease-in-out",
              transform: `translateX(-${slide * slideWidth}px)`,
            }}
          >
            {renderedImages.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                className="h-[300px] shrink-0 border-r border-white/10 last:border-r-0"
                style={{ width: isDesktop ? "25%" : "66.666667%" }}
              >
                {/* Carousel slides are intentionally non-interactive. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/carousel/${image.sourceName}`}
                  alt={image.altText}
                  draggable={false}
                  className="pointer-events-none h-full w-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-xs tracking-[0.25em] text-white/60 uppercase">
          Courtesy of Megapixels
        </p>
      </div>
    </section>
  );
}