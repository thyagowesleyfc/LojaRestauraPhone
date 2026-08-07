"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type HeroCarouselProps = {
  banners: Array<{
    id: string;
    imageUrl: string;
    redirectUrl: string;
    altText: string | null;
  }>;
  fallbackTitle: string;
};

export function HeroCarousel({ banners, fallbackTitle }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (banners.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!hasBanners) {
    return (
      <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-border bg-secondary">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="relative flex min-h-[320px] items-end p-6 sm:p-10">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-6xl">
              {fallbackTitle}
            </h1>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">
              Banners ativos aparecem aqui assim que forem cadastrados no
              painel administrativo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const banner = banners[currentIndex];

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-card">
      <a className="block" href={banner.redirectUrl}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={banner.altText ?? fallbackTitle}
          className="h-[340px] w-full object-cover sm:h-[460px]"
          src={banner.imageUrl}
        />
      </a>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
      {banners.length > 1 ? (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            aria-label="Banner anterior"
            onClick={() =>
              setCurrentIndex(
                (currentIndex - 1 + banners.length) % banners.length
              )
            }
            size="sm"
            type="button"
            variant="secondary"
          >
            &lt;
          </Button>
          <Button
            aria-label="Proximo banner"
            onClick={() => setCurrentIndex((currentIndex + 1) % banners.length)}
            size="sm"
            type="button"
            variant="secondary"
          >
            &gt;
          </Button>
        </div>
      ) : null}
      {banners.length > 1 ? (
        <div className="absolute bottom-5 left-5 flex gap-1.5">
          {banners.map((item, index) => (
            <button
              aria-label={`Ir para banner ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-7 bg-primary"
                  : "w-2 bg-background/80"
              }`}
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}