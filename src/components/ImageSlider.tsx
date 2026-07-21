import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
  autoPlayInterval?: number;
  enableZoom?: boolean;
}

function ImageSliderBase({
  images,
  alt = "",
  className = "",
  autoPlayInterval = 4000,
  enableZoom = true,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const total = images.length;

  const go = useCallback(
    (idx: number) => setCurrent(((idx % total) + total) % total),
    [total]
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Autoplay
  useEffect(() => {
    if (total < 2 || paused) return;
    const id = window.setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [total, paused, autoPlayInterval]);

  if (total === 0) {
    // Elegant high-quality Unsplash fallbacks for web design showcases
    const fallbackImages = [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
    ];
    // Consistently select a fallback based on alt text hash or length to keep it deterministic per post
    const index = Math.abs(alt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackImages.length;
    return (
      <img
        src={fallbackImages[index]}
        alt={alt || "RABOLA Project Showcase"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  if (total === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${enableZoom ? "transition-transform duration-500 hover:scale-105" : ""} ${className}`}
      />
    );
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      touchDeltaX.current < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    // small delay before resuming so users see the change
    window.setTimeout(() => setPaused(false), 300);
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden group/slider select-none ${enableZoom ? "transition-transform duration-500 group-hover:scale-[1.02]" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            i === current ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={{ willChange: "opacity" }}
        />
      ))}

      <button
        type="button"
        aria-label="Oldingi rasm"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-md z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Keyingi rasm"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-md z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}-rasmga o'tish`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-white shadow" : "w-1.5 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const ImageSlider = memo(ImageSliderBase);
export default ImageSlider;
