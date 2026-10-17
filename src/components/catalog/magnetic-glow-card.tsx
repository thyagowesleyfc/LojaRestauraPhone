"use client";

import type { PointerEvent, ReactNode } from "react";

type MagneticGlowCardProps = {
  children: ReactNode;
  className?: string;
};

function updateGlowPosition(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType === "touch") {
    return;
  }

  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;

  card.style.setProperty("--magnetic-glow-x", `${x}%`);
  card.style.setProperty("--magnetic-glow-y", `${y}%`);
}

function resetGlowPosition(event: PointerEvent<HTMLDivElement>) {
  const card = event.currentTarget;

  card.style.setProperty("--magnetic-glow-x", "50%");
  card.style.setProperty("--magnetic-glow-y", "50%");
}

export function MagneticGlowCard({
  children,
  className = ""
}: MagneticGlowCardProps) {
  return (
    <div
      className={`magnetic-glow-card ${className}`}
      onPointerLeave={resetGlowPosition}
      onPointerMove={updateGlowPosition}
    >
      <span
        aria-hidden="true"
        className="magnetic-glow-card__effect"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
