"use client";

import { useEffect, useRef, useState } from "react";

type CarouselImage = {
  id: string;
  altText: string;
};

const ROTATION_INTERVAL_MS = 6_000;

export default function HomepageCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [width, setWidth] = useState(0);
  const [slide, setSlide] = useState(0);

  // Fetch images from local public folder
  useEffect(() => {
    fetch("/api/carousel")
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

  const isDesktop = width >= 1024;
  const slideWidth = isDesktop ? width / 4 : width / 1.5;

  const renderedImages = images.length > 1 ? [...images, ...images] : images;

  return (
    <section className="border-y border-white/10 bg-[#0d0f14]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div ref={viewportRef} className="overflow-hidden border border-white/10 bg-[#101218]">
          <div
            className="flex"
            style={{
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
                <img
                  src={`/carousel/${image.id}`}
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