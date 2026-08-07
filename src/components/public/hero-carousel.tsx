"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type HeroCarouselProps = {
  banners: Array<{
    id: string;
    imageUrl: string;
    mobileImageUrl: string | null;
    redirectUrl: string;
    altText: string | null;
  }>;
  fallbackTitle: string;
  autoplaySeconds: number;
};

const heroCopy =
  "Acessorios, capas, carregadores e promocoes selecionados para resolver a compra rapido pelo WhatsApp.";

export function HeroCarousel({
  banners,
  fallbackTitle,
  autoplaySeconds
}: HeroCarouselProps) {
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
    return (
      <section className="relative min-h-[520px] overflow-hidden border-b border-border bg-muted/50">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="mx-auto flex min-h-[520px] w-full max-w-6xl items-end px-6 py-12 sm:items-center sm:py-16">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-6xl">
              {fallbackTitle}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {heroCopy}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/categorias">Montar carrinho</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/promocoes">Ver promocoes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];
  const headline = currentBanner.altText?.trim() || fallbackTitle;

  return (
    <section
      aria-label="Destaques da loja"
      className="relative min-h-[560px] overflow-hidden border-b border-border bg-background"
    >
      <div className="absolute inset-0">
        {banners.map((banner, index) => {
          const active = index === currentIndex;

          return (
            <div
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                active ? "opacity-100" : "opacity-0"
              }`}
              key={banner.id}
            >
              {banner.mobileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="h-full w-full object-cover sm:hidden"
                  src={banner.mobileImageUrl}
                />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className={`h-full w-full object-cover ${
                  banner.mobileImageUrl ? "hidden sm:block" : ""
                }`}
                src={banner.imageUrl}
              />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/82 to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent sm:hidden" />
      </div>

      <div className="relative mx-auto flex min-h-[560px] w-full max-w-6xl items-end px-6 py-12 sm:items-center sm:py-16">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-6xl">
            {headline}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {heroCopy}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={currentBanner.redirectUrl}>Ver destaque</a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/categorias">Montar carrinho</Link>
            </Button>
          </div>
        </div>
      </div>

      {banners.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 backdrop-blur">
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