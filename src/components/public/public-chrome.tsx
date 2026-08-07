"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PublicChromeProps = {
  settings: {
    tradeName: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    mapEmbedUrl: string;
    whatsappNumber: string;
    whatsappInitialMessage: string;
    logoUrl: string | null;
  };
};

export function PublicChrome({ settings }: PublicChromeProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        settings.whatsappInitialMessage
      )}`
    : null;

  return (
    <>
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-2">
          <div className="space-y-3">
            <Link className="flex items-center gap-3" href="/">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={settings.tradeName}
                  className="h-10 max-w-32 object-contain"
                  src={settings.logoUrl}
                />
              ) : null}
              <span className="font-semibold">{settings.tradeName}</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              {settings.cnpj ? `CNPJ: ${settings.cnpj}` : "CNPJ nao informado"}
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {settings.phone ? <p>{settings.phone}</p> : null}
            {settings.email ? <p>{settings.email}</p> : null}
            {settings.address ? <p>{settings.address}</p> : null}
            {settings.mapEmbedUrl ? (
              <a
                className="inline-flex text-primary hover:underline"
                href={settings.mapEmbedUrl}
                rel="noreferrer"
                target="_blank"
              >
                Ver mapa
              </a>
            ) : null}
          </div>
        </div>
      </footer>
      {whatsappHref ? (
        <a
          className="fixed bottom-5 right-5 z-50 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          href={whatsappHref}
          rel="noreferrer"
          target="_blank"
        >
          WhatsApp
        </a>
      ) : null}
    </>
  );
}
