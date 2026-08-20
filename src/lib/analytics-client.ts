"use client";

import type { AnalyticsEventInput, AnalyticsEventType } from "@/schemas/analytics";

const ANALYTICS_SESSION_KEY = "rp_analytics_session_id";
const ANALYTICS_UTM_KEY = "rp_analytics_utm";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
] as const;

type StoredUtm = NonNullable<AnalyticsEventInput["utm"]>;

type TrackAnalyticsEventInput = Omit<
  AnalyticsEventInput,
  "pagePath" | "sessionId" | "utm"
> & {
  pagePath?: string;
  sessionId?: string;
  type: AnalyticsEventType;
  utm?: StoredUtm;
};

function createSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getAnalyticsSessionId() {
  const storedSessionId = window.localStorage.getItem(ANALYTICS_SESSION_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const sessionId = createSessionId();
  window.localStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);

  return sessionId;
}

function readStoredUtm() {
  const rawUtm = window.localStorage.getItem(ANALYTICS_UTM_KEY);

  if (!rawUtm) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawUtm) as StoredUtm;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

function captureUtmFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  const utm: StoredUtm = {};

  for (const key of UTM_KEYS) {
    const value = searchParams.get(key)?.trim();

    if (value) {
      const targetKey = key.replace("utm_", "") as keyof StoredUtm;
      utm[targetKey] = value;
    }
  }

  if (Object.keys(utm).length === 0) {
    return readStoredUtm();
  }

  window.localStorage.setItem(ANALYTICS_UTM_KEY, JSON.stringify(utm));

  return utm;
}

function getCurrentPagePath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function trackAnalyticsEvent(event: TrackAnalyticsEventInput) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: AnalyticsEventInput = {
    ...event,
    pagePath: event.pagePath ?? getCurrentPagePath(),
    sessionId: event.sessionId ?? getAnalyticsSessionId(),
    utm: event.utm ?? captureUtmFromLocation()
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/events", blob);
    return;
  }

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  }).catch(() => undefined);
}