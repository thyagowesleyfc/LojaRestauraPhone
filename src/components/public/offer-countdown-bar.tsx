"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import { getAnalyticsSessionId } from "@/lib/analytics-client";

const COUNTDOWN_STORAGE_PREFIX = "rp_offer_countdown_started_at";

function getOfferStorageKey({
  durationSeconds,
  headline,
  href,
  sessionId
}: {
  durationSeconds: number;
  headline: string;
  href: string;
  sessionId: string;
}) {
  return `${COUNTDOWN_STORAGE_PREFIX}:${sessionId}:${encodeURIComponent(
    `${headline}|${href}|${durationSeconds}`
  )}`;
}

function getReadableTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace("#", "");
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? "#111827" : "#ffffff";
}

function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

type OfferCountdownBarProps = {
  backgroundColor: string;
  durationSeconds: number;
  headline: string;
  href: string;
};

export function OfferCountdownBar({
  backgroundColor,
  durationSeconds,
  headline,
  href
}: OfferCountdownBarProps) {
  const normalizedHeadline = headline.trim();
  const normalizedHref = href.trim();
  const enabled =
    normalizedHeadline.length > 0 &&
    normalizedHref.length > 0 &&
    durationSeconds > 0;
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sessionId = getAnalyticsSessionId();
    const storageKey = getOfferStorageKey({
      durationSeconds,
      headline: normalizedHeadline,
      href: normalizedHref,
      sessionId
    });
    const storedStartedAt = Number(window.localStorage.getItem(storageKey));
    const startedAt =
      Number.isFinite(storedStartedAt) && storedStartedAt > 0
        ? storedStartedAt
        : Date.now();

    if (!storedStartedAt) {
      window.localStorage.setItem(storageKey, String(startedAt));
    }

    function updateRemainingSeconds() {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setRemainingSeconds(Math.max(durationSeconds - elapsedSeconds, 0));
    }

    updateRemainingSeconds();
    const interval = window.setInterval(updateRemainingSeconds, 1000);

    return () => window.clearInterval(interval);
  }, [durationSeconds, enabled, normalizedHeadline, normalizedHref]);

  if (!enabled || remainingSeconds <= 0) {
    return null;
  }

  const style = {
    backgroundColor,
    color: getReadableTextColor(backgroundColor)
  } satisfies CSSProperties;
  const content = (
    <span className="mx-auto flex h-full w-full max-w-6xl flex-row items-center justify-between gap-3 px-4 text-left sm:justify-center sm:gap-4 sm:px-6">
      <span className="line-clamp-2 min-w-0 flex-1 text-left text-sm font-semibold leading-tight sm:flex-none sm:text-center sm:text-base">
        {normalizedHeadline}
      </span>
      <span className="shrink-0 rounded-md bg-black/15 px-3 py-1 font-mono text-lg font-semibold leading-none tabular-nums sm:text-xl">
        {formatRemainingTime(remainingSeconds)}
      </span>
    </span>
  );
  const className =
    "block h-[10vh] min-h-16 w-full transition-opacity focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

  if (isInternalHref(normalizedHref)) {
    return (
      <Link className={className} href={normalizedHref} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <a className={className} href={normalizedHref} style={style}>
      {content}
    </a>
  );
}