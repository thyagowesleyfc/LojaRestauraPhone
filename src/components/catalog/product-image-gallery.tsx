"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductGalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
};

type ProductImageGalleryProps = {
  images: ProductGalleryImage[];
  productDescription: string;
};

export function ProductImageGallery({
  images,
  productDescription
}: ProductImageGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState(
    images[0]?.id ?? null
  );
  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;

  if (!selectedImage) {
    return (
      <section className="flex justify-center">
        <div className="aspect-square w-4/5 max-w-xl rounded-lg border border-border bg-muted" />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="mx-auto w-4/5 max-w-xl">
        <img
          alt={selectedImage.altText ?? productDescription}
          className="aspect-square w-full rounded-lg border border-border object-cover"
          src={selectedImage.url}
        />
      </div>
      {images.length > 1 ? (
        <div
          aria-label="Selecionar foto do produto"
          className="mx-auto flex w-4/5 max-w-xl gap-2 overflow-x-auto pb-1"
        >
          {images.map((image, index) => {
            const isSelected = image.id === selectedImage.id;

            return (
              <button
                aria-current={isSelected ? "true" : undefined}
                aria-label={`Exibir foto ${index + 1} de ${productDescription}`}
                className={cn(
                  "size-16 shrink-0 rounded-md border bg-background p-1 transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:size-20",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-inset ring-primary"
                    : "border-border opacity-70 hover:border-primary/70 hover:opacity-100"
                )}
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                type="button"
              >
                <img
                  alt={image.altText ?? `${productDescription} foto ${index + 1}`}
                  className="size-full rounded object-cover"
                  src={image.url}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}