"use client";

import type { AnalyticsEventInput, AnalyticsEventType } from "@/schemas/analytics";
import { getClientAnalyticsDedupeKey } from "@/lib/analytics-dedupe";

const ANALYTICS_SESSION_KEY = "rp_analytics_session_id";
const ANALYTICS_UTM_KEY = "rp_analytics_utm";
const ANALYTICS_DEDUPE_KEY = "rp_analytics_dedupe_keys";
const MAX_ANALYTICS_DEDUPE_KEYS = 500;
const ANALYTICS_BATCH_SIZE = 10;
const ANALYTICS_BATCH_DELAY_MS = 1000;
const inMemoryDedupeKeys = new Set<string>();
const pendingAnalyticsEvents: AnalyticsEventInput[] = [];
let analyticsFlushTimer: number | null = null;
let analyticsFlushListenersRegistered = false;
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
] as const;
const FORWARDED_EVENT_TYPES = new Set<AnalyticsEventType>([
  "PRODUCT_VIEW",
  "SEARCH",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "WHATSAPP_CLICK",
  "ORDER_SENT_TO_WHATSAPP",
  "LINK_CLICK"
]);

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

type ExternalTrackingPayload = Record<string, string | number | StoredUtm | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (eventName: string, payload?: ExternalTrackingPayload) => void;
    };
  }
}

function createSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getAnalyticsSessionId() {
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

function hasAlreadyTrackedInThisTab(key: string) {
  if (inMemoryDedupeKeys.has(key)) {
    return true;
  }

  inMemoryDedupeKeys.add(key);

  try {
    const rawKeys = window.sessionStorage.getItem(ANALYTICS_DEDUPE_KEY);
    const storedKeys = rawKeys ? (JSON.parse(rawKeys) as unknown) : [];
    const dedupeKeys = Array.isArray(storedKeys)
      ? storedKeys.filter((value): value is string => typeof value === "string")
      : [];

    if (dedupeKeys.includes(key)) {
      return true;
    }

    window.sessionStorage.setItem(
      ANALYTICS_DEDUPE_KEY,
      JSON.stringify([...dedupeKeys, key].slice(-MAX_ANALYTICS_DEDUPE_KEYS))
    );
  } catch {
    // O rastreamento continua funcionando mesmo quando o storage está indisponível.
  }

  return false;
}

function toGtmEventName(type: AnalyticsEventType) {
  return type.toLowerCase();
}

function toMetaEventName(type: AnalyticsEventType) {
  const eventNames: Partial<Record<AnalyticsEventType, string>> = {
    ADD_TO_CART: "AddToCart",
    ORDER_SENT_TO_WHATSAPP: "Lead",
    PRODUCT_VIEW: "ViewContent",
    SEARCH: "Search",
    WHATSAPP_CLICK: "Contact",
    LINK_CLICK: "Lead"
  };

  return eventNames[type] ?? null;
}

function toTikTokEventName(type: AnalyticsEventType) {
  const eventNames: Partial<Record<AnalyticsEventType, string>> = {
    ADD_TO_CART: "AddToCart",
    ORDER_SENT_TO_WHATSAPP: "SubmitForm",
    PRODUCT_VIEW: "ViewContent",
    SEARCH: "Search",
    WHATSAPP_CLICK: "Contact",
    LINK_CLICK: "ClickButton"
  };

  return eventNames[type] ?? null;
}

function buildExternalPayload(event: AnalyticsEventInput): ExternalTrackingPayload {
  return {
    category_id: event.categoryId ?? null,
    link_id: event.linkId ?? null,
    page_path: event.pagePath,
    product_id: event.productId ?? null,
    product_variant_id: event.productVariantId ?? null,
    promotion_id: event.promotionId ?? null,
    results_count: event.resultsCount ?? null,
    search_string: event.searchTerm ?? null,
    session_id: event.sessionId,
    utm: event.utm ?? null
  };
}

function trackExternalProviders(event: AnalyticsEventInput) {
  if (!FORWARDED_EVENT_TYPES.has(event.type)) {
    return;
  }

  const payload = buildExternalPayload(event);

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    ...payload,
    event: toGtmEventName(event.type)
  });

  const metaEventName = toMetaEventName(event.type);

  if (metaEventName && window.fbq) {
    window.fbq("track", metaEventName, payload);
  } else if (event.type === "REMOVE_FROM_CART" && window.fbq) {
    window.fbq("trackCustom", "RemoveFromCart", payload);
  }

  const tiktokEventName = toTikTokEventName(event.type);

  if (tiktokEventName && window.ttq?.track) {
    window.ttq.track(tiktokEventName, payload);
  } else if (event.type === "REMOVE_FROM_CART" && window.ttq?.track) {
    window.ttq.track("RemoveFromCart", payload);
  }
}

function sendAnalyticsBatch(events: AnalyticsEventInput[]) {
  const body = JSON.stringify({ events });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });

    if (navigator.sendBeacon("/api/analytics/events", blob)) {
      return;
    }
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

function scheduleAnalyticsFlush() {
  if (analyticsFlushTimer !== null) {
    return;
  }

  analyticsFlushTimer = window.setTimeout(() => {
    analyticsFlushTimer = null;
    flushAnalyticsEvents();
  }, ANALYTICS_BATCH_DELAY_MS);
}

function flushAnalyticsEvents() {
  if (analyticsFlushTimer !== null) {
    window.clearTimeout(analyticsFlushTimer);
    analyticsFlushTimer = null;
  }

  if (pendingAnalyticsEvents.length === 0) {
    return;
  }

  const events = pendingAnalyticsEvents.splice(0, ANALYTICS_BATCH_SIZE);
  sendAnalyticsBatch(events);

  if (pendingAnalyticsEvents.length > 0) {
    scheduleAnalyticsFlush();
  }
}

function registerAnalyticsFlushListeners() {
  if (analyticsFlushListenersRegistered) {
    return;
  }

  window.addEventListener("pagehide", flushAnalyticsEvents);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushAnalyticsEvents();
    }
  });
  analyticsFlushListenersRegistered = true;
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

  const dedupeKey = getClientAnalyticsDedupeKey(payload);

  if (dedupeKey && hasAlreadyTrackedInThisTab(dedupeKey)) {
    return;
  }

  trackExternalProviders(payload);

  if (payload.type === "REMOVE_FROM_CART") {
    return;
  }

  pendingAnalyticsEvents.push(payload);
  registerAnalyticsFlushListeners();

  if (pendingAnalyticsEvents.length >= ANALYTICS_BATCH_SIZE) {
    flushAnalyticsEvents();
    return;
  }

  scheduleAnalyticsFlush();
}
