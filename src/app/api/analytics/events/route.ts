import { NextResponse } from "next/server";

import { getAnalyticsEventDedupeKey } from "@/lib/analytics-events";
import { prisma } from "@/lib/prisma";
import { analyticsEventSchema } from "@/schemas/analytics";

function normalizeSearchTerm(searchTerm: string | undefined) {
  return searchTerm
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Evento de analytics invalido." },
      { status: 400 }
    );
  }

  const event = parsed.data;
  const dedupeKey = getAnalyticsEventDedupeKey(event);
  const data = {
    type: event.type,
    sessionId: event.sessionId,
    dedupeKey,
    productId: event.productId ?? null,
    productVariantId: event.productVariantId ?? null,
    promotionId: event.promotionId ?? null,
    categoryId: event.categoryId ?? null,
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

  if (dedupeKey) {
    await prisma.analyticsEvent.upsert({
      create: data,
      update: {},
      where: { dedupeKey }
    });
  } else {
    await prisma.analyticsEvent.create({ data });
  }

  return NextResponse.json({ ok: true });
}