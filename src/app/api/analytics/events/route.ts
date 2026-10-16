import { NextResponse } from "next/server";

import { getAnalyticsEventDedupeKey } from "@/lib/analytics-events";
import { prisma } from "@/lib/prisma";
import {
  analyticsEventBatchSchema,
  analyticsEventSchema,
  type AnalyticsEventInput
} from "@/schemas/analytics";

function normalizeSearchTerm(searchTerm: string | undefined) {
  return searchTerm
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") || null;
}

function toAnalyticsEventData(event: AnalyticsEventInput) {
  return {
    type: event.type,
    sessionId: event.sessionId,
    dedupeKey: getAnalyticsEventDedupeKey(event),
    productId: event.productId ?? null,
    productVariantId: event.productVariantId ?? null,
    promotionId: event.promotionId ?? null,
    categoryId: event.categoryId ?? null,
    linkId: event.linkId ?? null,
    searchTerm: event.searchTerm ?? null,
    searchTermNormalized: normalizeSearchTerm(event.searchTerm),
    resultsCount: event.resultsCount ?? null,
    pagePath: event.pagePath,
    utmSource: event.utm?.source ?? null,
    utmMedium: event.utm?.medium ?? null,
    utmCampaign: event.utm?.campaign ?? null,
    utmTerm: event.utm?.term ?? null,
    utmContent: event.utm?.content ?? null
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBatch = analyticsEventBatchSchema.safeParse(body);
  const parsedEvent = analyticsEventSchema.safeParse(body);
  const events = parsedBatch.success
    ? parsedBatch.data.events
    : parsedEvent.success
      ? [parsedEvent.data]
      : null;

  if (!events) {
    return NextResponse.json(
      { error: "Evento de analytics inválido." },
      { status: 400 }
    );
  }

  const persistedEvents = events.filter(
    (event) => event.type !== "REMOVE_FROM_CART"
  );

  if (persistedEvents.length > 0) {
    await prisma.analyticsEvent.createMany({
      data: persistedEvents.map(toAnalyticsEventData),
      skipDuplicates: true
    });
  }

  return NextResponse.json({
    ok: true,
    received: events.length,
    persisted: persistedEvents.length
  });
}
