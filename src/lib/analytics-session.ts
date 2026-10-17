export const ANALYTICS_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type StoredAnalyticsSession = {
  id: string;
  createdAt: number;
};

export function serializeAnalyticsSession(session: StoredAnalyticsSession) {
  return JSON.stringify(session);
}

export function parseAnalyticsSession(
  value: string | null,
  now = Date.now()
): StoredAnalyticsSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredAnalyticsSession>;
    const createdAt = Number(parsed.createdAt);
    const age = now - createdAt;

    if (
      typeof parsed.id !== "string" ||
      parsed.id.trim().length === 0 ||
      !Number.isFinite(createdAt) ||
      age < 0 ||
      age >= ANALYTICS_SESSION_TTL_MS
    ) {
      return null;
    }

    return {
      createdAt,
      id: parsed.id
    };
  } catch {
    return null;
  }
}
