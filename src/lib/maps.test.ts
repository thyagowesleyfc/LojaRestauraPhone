import assert from "node:assert/strict";
import { test } from "node:test";

import { getGoogleMapsLinkUrl } from "@/lib/maps";

const embedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.2407843026776!2d-42.762723625018445!3d-5.064678194912064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x78e3b20db6aa795%3A0x8b0988c8aa1b17e5!2sRestaura%20Phone%20%7C%20Assist%C3%AAncia%20T%C3%A9cnica!5e0";

test("builds a navigable Google Maps link from the verified store pin", () => {
  assert.equal(
    getGoogleMapsLinkUrl({ mapEmbedUrl: embedUrl }),
    "https://www.google.com/maps/search/?api=1&query=-5.064666666666666%2C-42.76013888888889"
  );
});

test("keeps regular map URLs unchanged", () => {
  const url = "https://www.google.com/maps/place/Restaura+Phone";

  assert.equal(getGoogleMapsLinkUrl({ mapEmbedUrl: url }), url);
});

test("falls back to address and trade name when map URL is missing", () => {
  assert.equal(
    getGoogleMapsLinkUrl({
      address: "Rua Exemplo, 123",
      tradeName: "RestauraPhone"
    }),
    "https://www.google.com/maps/search/?api=1&query=Rua%20Exemplo%2C%20123%20RestauraPhone"
  );
});