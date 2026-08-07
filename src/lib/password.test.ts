import assert from "node:assert/strict";
import { test } from "node:test";

import { hashPassword, verifyPassword } from "./password";

test("hashPassword creates verifiable bcrypt hashes", async () => {
  const passwordHash = await hashPassword("senha-segura-123");

  assert.match(passwordHash, /^\$2[aby]\$/);
  assert.equal(await verifyPassword("senha-segura-123", passwordHash), true);
  assert.equal(await verifyPassword("senha-incorreta", passwordHash), false);
});
