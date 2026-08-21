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
const FORWARDED_EVENT_TYPES = new Set<AnalyticsEventType>([
  "PRODUCT_VIEW",
  "SEARCH",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "WHATSAPP_CLICK",
  "ORDER_SENT_TO_WHATSAPP"
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

function toGtmEventName(type: AnalyticsEventType) {
  return type.toLowerCase();
}

function toMetaEventName(type: AnalyticsEventType) {
  const eventNames: Partial<Record<AnalyticsEventType, string>> = {
    ADD_TO_CART: "AddToCart",
    ORDER_SENT_TO_WHATSAPP: "Lead",
    PRODUCT_VIEW: "ViewContent",
    SEARCH: "Search",
    WHATSAPP_CLICK: "Contact"
  };

  return eventNames[type] ?? null;
}

function toTikTokEventName(type: AnalyticsEventType) {
  const eventNames: Partial<Record<AnalyticsEventType, string>> = {
    ADD_TO_CART: "AddToCart",
    ORDER_SENT_TO_WHATSAPP: "SubmitForm",
    PRODUCT_VIEW: "ViewContent",
    SEARCH: "Search",
    WHATSAPP_CLICK: "Contact"
  };

  return eventNames[type] ?? null;
}

function buildExternalPayload(event: AnalyticsEventInput): ExternalTrackingPayload {
  return {
    category_id: event.categoryId ?? null,
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

  trackExternalProviders(payload);

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