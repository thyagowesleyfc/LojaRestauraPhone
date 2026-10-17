import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ANALYTICS_SESSION_TTL_MS,
  parseAnalyticsSession,
  serializeAnalyticsSession
} from "./analytics-session";

const now = 1_700_000_000_000;

test("mantém o sessionId durante as primeiras 24 horas", () => {
  const stored = serializeAnalyticsSession({
    createdAt: now,
    id: "session-1"
  });

  assert.deepEqual(
    parseAnalyticsSession(stored, now + ANALYTICS_SESSION_TTL_MS - 1),
    { createdAt: now, id: "session-1" }
  );
});

test("expira o sessionId ao completar 24 horas", () => {
  const stored = serializeAnalyticsSession({
    createdAt: now,
    id: "session-1"
  });

  assert.equal(parseAnalyticsSession(stored, now + ANALYTICS_SESSION_TTL_MS), null);
});

test("descarta o formato antigo e dados inválidos", () => {
  assert.equal(parseAnalyticsSession("session-legacy", now), null);
  assert.equal(parseAnalyticsSession(JSON.stringify({ id: "session-1" }), now), null);
});
