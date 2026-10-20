import assert from "node:assert/strict";
import { test } from "node:test";

import { getPrivacyPageContent } from "@/lib/privacy-content";

test("substitui o nome legado pelo nome configurado na política de privacidade", () => {
  assert.equal(
    getPrivacyPageContent(
      "<p>A RestauraPhone protege seus dados.</p>",
      "Minha Loja"
    ),
    "<p>A Minha Loja protege seus dados.</p>"
  );
});
