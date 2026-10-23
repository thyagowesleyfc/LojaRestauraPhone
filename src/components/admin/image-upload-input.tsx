"use client";

import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";

import { getOversizedImage } from "@/lib/image-upload";
import { cn } from "@/lib/utils";

type ImageUploadInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
>;

export function ImageUploadInput({
  className,
  id,
  "aria-describedby": ariaDescribedBy,
  ...props
}: ImageUploadInputProps) {
  const [error, setError] = useState<string>();
  const errorId = id ? `${id}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const oversizedImage = getOversizedImage(
      Array.from(event.currentTarget.files ?? [])
    );

    if (oversizedImage) {
      event.currentTarget.value = "";
      setError("Não é possível subir imagens maiores que 5 MB.");
      return;
    }

    setError(undefined);
  }

  return (
    <>
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className,
          error && "border-destructive focus-visible:border-destructive"
        )}
        id={id}
        onChange={handleChange}
        type="file"
      />
      {error ? (
        <p className="text-xs leading-5 text-destructive" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
