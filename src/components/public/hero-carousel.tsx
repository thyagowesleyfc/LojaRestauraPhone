"use client";

import { useEffect, useState } from "react";

type HeroCarouselProps = {
  banners: Array<{
    id: string;
    imageUrl: string;
    mobileImageUrl: string | null;
    redirectUrl: string;
    altText: string | null;
  }>;
  autoplaySeconds: number;
};

export function HeroCarousel({ banners, autoplaySeconds }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasBanners = banners.length > 0;
  const safeAutoplaySeconds = Math.min(30, Math.max(3, autoplaySeconds || 5));

  useEffect(() => {
    if (banners.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length);
    }, safeAutoplaySeconds * 1000);

    return () => window.clearInterval(timer);
  }, [banners.length, safeAutoplaySeconds]);

  if (!hasBanners) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const imageAlt = currentBanner.altText?.trim() ?? "";

  return (
    <section
      aria-label="Destaques da loja"
      className="relative h-[28vh] max-h-[28vh] overflow-hidden border-b border-border bg-muted md:h-[40vh] md:max-h-[40vh] lg:h-[48vh] lg:max-h-[48vh]"
    >
      <a
        aria-label={imageAlt || "Abrir destaque"}
        className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={currentBanner.redirectUrl}
      >
        <picture>
          {currentBanner.mobileImageUrl ? (
            <source
              media="(max-width: 639px)"
              srcSet={currentBanner.mobileImageUrl}
            />
          ) : null}
          <img
            alt={imageAlt}
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
            loading={currentIndex === 0 ? "eager" : "lazy"}
            src={currentBanner.imageUrl}
          />
        </picture>
      </a>

      {banners.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2">
          {banners.map((banner, index) => (
            <button
              aria-label={`Ir para banner ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
              key={banner.id}
              onClick={() => setCurrentIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
