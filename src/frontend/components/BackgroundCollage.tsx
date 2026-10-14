"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { collageImages } from "@/data/collage-images";

type CollageTile = {
  key: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  delay: number;
  loaded: boolean;
};

type TileStyle = CSSProperties & {
  "--tile-left": string;
  "--tile-top": string;
  "--tile-width": string;
  "--tile-height": string;
  "--tile-rotation": string;
  "--tile-delay": string;
};

function shuffle<T>(items: readonly T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function makeSelection() {
  const count = Math.min(
    collageImages.length,
    12 + Math.floor(Math.random() * 9),
  );

  return shuffle(collageImages).slice(0, count);
}

function makeTiles(images: string[], width: number, height: number) {
  const layoutId = Math.random().toString(36).slice(2);
  const columns = width < 520 ? 2 : width < 900 ? 3 : 4;
  const columnWidth = width / columns;
  const rowHeight = 280;
  const rows = Math.ceil(height / rowHeight) + 1;
  const positions = shuffle(
    Array.from({ length: rows * columns }, (_, index) => ({
      row: Math.floor(index / columns),
      column: index % columns,
    })),
  );
  const sources: string[] = [];

  while (sources.length < positions.length) {
    sources.push(...shuffle(images));
  }

  let delay = 0;

  return sources.slice(0, positions.length).map((src, index) => {
    if (index > 0) delay = Math.min(delay + 45 + Math.random() * 50, 900);
    const { row, column } = positions[index];
    const scale = [0.64, 0.78, 0.92][Math.floor(Math.random() * 3)];
    const tileWidth = Math.round(columnWidth * scale);
    const tileHeight = Math.round(170 + Math.random() * 100);
    const horizontalJitter = (Math.random() - 0.5) * columnWidth * 0.2;
    const verticalJitter = (Math.random() - 0.5) * 64;
    const left = Math.max(
      0,
      Math.min(
        Math.round(column * columnWidth + horizontalJitter),
        width - tileWidth,
      ),
    );
    const top = Math.max(
      0,
      Math.min(
        Math.round(row * rowHeight + verticalJitter),
        Math.max(0, height - tileHeight),
      ),
    );

    return {
      key: `${layoutId}-${index}-${src}`,
      src,
      left,
      top,
      width: tileWidth,
      height: tileHeight,
      rotation: Math.round((Math.random() * 8 - 4) * 10) / 10,
      delay: Math.round(delay),
      loaded: false,
    };
  });
}

export default function BackgroundCollage({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<string[]>([]);
  const hasRenderedRouteRef = useRef(false);
  const [tiles, setTiles] = useState<CollageTile[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const updateLayout = () => {
      if (imagesRef.current.length === 0) return;
      const bounds = shell.getBoundingClientRect();
      const width = Math.round(bounds.width || window.innerWidth);
      const height = Math.round(Math.max(bounds.height, window.innerHeight));
      setTiles(makeTiles(imagesRef.current, width, height));
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(shell);
    updateLayout();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setIsVisible(false);
    const waitBeforeReplacing = hasRenderedRouteRef.current ? 750 : 0;
    hasRenderedRouteRef.current = true;

    const timeout = window.setTimeout(() => {
      imagesRef.current = makeSelection();
      const shell = shellRef.current;
      const bounds = shell?.getBoundingClientRect();
      const width = Math.round(bounds?.width || window.innerWidth);
      const height = Math.round(
        Math.max(bounds?.height ?? 0, window.innerHeight),
      );

      setTiles(makeTiles(imagesRef.current, width, height));
      window.requestAnimationFrame(() => setIsVisible(true));
    }, waitBeforeReplacing);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  async function revealLoadedImage(
    event: SyntheticEvent<HTMLImageElement>,
    tileKey: string,
  ) {
    const image = event.currentTarget;

    try {
      await image.decode();
    } catch {
      if (!image.complete || image.naturalWidth === 0) return;
    }

    if (image.naturalWidth === 0 || image.naturalHeight === 0) return;
    setTiles((current) =>
      current.map((tile) =>
        tile.key === tileKey ? { ...tile, loaded: true } : tile,
      ),
    );
  }

  return (
    <div ref={shellRef} className="collage-shell">
      <div
        className={`background-collage${isVisible ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        {tiles.map((tile) => (
          <div
            className={`collage-tile${tile.loaded ? " is-loaded" : ""}`}
            key={tile.key}
            style={
              {
                "--tile-left": `${tile.left}px`,
                "--tile-top": `${tile.top}px`,
                "--tile-width": `${tile.width}px`,
                "--tile-height": `${tile.height}px`,
                "--tile-rotation": `${tile.rotation}deg`,
                "--tile-delay": `${tile.delay}ms`,
              } as TileStyle
            }
          >
            <img
              src={tile.src}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={(event) => void revealLoadedImage(event, tile.key)}
            />
          </div>
        ))}
      </div>
      <div className="collage-content">{children}</div>
    </div>
  );
}
