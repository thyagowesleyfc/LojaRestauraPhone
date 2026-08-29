"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getAnalyticsSessionId } from "@/lib/analytics-client";

const COOKIE_CONSENT_STORAGE_PREFIX = "rp_cookie_consent";

type ConsentChoice = "accepted" | "rejected";

function getCookieConsentStorageKey(sessionId: string) {
  return `${COOKIE_CONSENT_STORAGE_PREFIX}:${sessionId}`;
}

export function CookieConsentModal() {
  const [visibleStorageKey, setVisibleStorageKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sessionId = getAnalyticsSessionId();
      const nextStorageKey = getCookieConsentStorageKey(sessionId);

      if (!window.localStorage.getItem(nextStorageKey)) {
        setVisibleStorageKey(nextStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function saveChoice(choice: ConsentChoice) {
    if (visibleStorageKey) {
      window.localStorage.setItem(visibleStorageKey, choice);
    }

    setVisibleStorageKey(null);
  }

  if (!visibleStorageKey) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-lg border border-border bg-card p-4 pr-11 text-card-foreground shadow-lg sm:bottom-6 sm:pr-12">
      <button
        aria-label="Fechar e rejeitar cookies"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-xs font-semibold leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => saveChoice("rejected")}
        type="button"
      >
        X
      </button>
      <div
        aria-label="Aviso de cookies"
        aria-modal="false"
        className="flex items-center justify-between gap-3"
        role="dialog"
      >
        <p className="min-w-0 flex-1 text-left text-sm leading-6 text-muted-foreground">
          Usamos cookies para melhorar sua experiencia. Consulte mais
          informacoes na nossa{" "}
          <Link
            className="font-medium text-primary underline underline-offset-4"
            href="/pagina-privacidade"
          >
            Pagina de privacidade
          </Link>
          .
        </p>
        <Button
          className="h-9 shrink-0 px-3"
          onClick={() => saveChoice("accepted")}
          type="button"
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}