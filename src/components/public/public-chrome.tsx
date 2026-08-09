/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  CART_UPDATED_EVENT,
  readCartItems
} from "@/components/cart/cart-storage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicChromeProps = {
  children: ReactNode;
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
    darkLogoUrl: string | null;
  };
};

const links = [
  { href: "/promocoes", label: "Promocoes" },
  { href: "/categorias", label: "Categorias" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/carrinho", label: "Carrinho" }
];

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7a7.2 7.2 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ThemeToggleIcon() {
  return (
    <>
      <span className="dark:hidden">
        <MoonIcon />
      </span>
      <span className="hidden dark:inline-flex">
        <SunIcon />
      </span>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.607M7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}
function BrandLogo({
  darkLogoUrl,
  imageClassName,
  logoUrl,
  textClassName,
  tradeName
}: {
  darkLogoUrl: string | null;
  imageClassName: string;
  logoUrl: string | null;
  textClassName: string;
  tradeName: string;
}) {
  if (logoUrl && darkLogoUrl) {
    return (
      <>
        <img
          alt={tradeName}
          className={cn(imageClassName, "dark:hidden")}
          src={logoUrl}
        />
        <img
          alt={tradeName}
          className={cn(imageClassName, "hidden dark:block")}
          src={darkLogoUrl}
        />
      </>
    );
  }

  if (logoUrl) {
    return <img alt={tradeName} className={imageClassName} src={logoUrl} />;
  }

  if (darkLogoUrl) {
    return (
      <>
        <span className={cn(textClassName, "dark:hidden")}>{tradeName}</span>
        <img
          alt={tradeName}
          className={cn(imageClassName, "hidden dark:block")}
          src={darkLogoUrl}
        />
      </>
    );
  }

  return <span className={textClassName}>{tradeName}</span>;
}

export function PublicChrome({ children, settings }: PublicChromeProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("rp_theme");

    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  useEffect(() => {
    function syncCartQuantity() {
      setCartQuantity(
        readCartItems().reduce((total, item) => total + item.quantity, 0)
      );
    }

    syncCartQuantity();
    window.addEventListener(CART_UPDATED_EVENT, syncCartQuantity);
    window.addEventListener("storage", syncCartQuantity);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartQuantity);
      window.removeEventListener("storage", syncCartQuantity);
    };
  }, []);

  function getLinkLabel(link: { href: string; label: string }) {
    if (link.href === "/carrinho" && cartQuantity > 0) {
      return `${link.label} (${cartQuantity})`;
    }

    return link.label;
  }

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("rp_theme", nextIsDark ? "dark" : "light");
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        settings.whatsappInitialMessage
      )}`
    : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <BrandLogo
              darkLogoUrl={settings.darkLogoUrl}
              imageClassName="h-16 w-40 shrink-0 border-0 bg-transparent object-contain p-0 shadow-none ring-0 sm:h-[72px] sm:w-64"
              logoUrl={settings.logoUrl}
              textClassName="truncate font-semibold"
              tradeName={settings.tradeName}
            />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Button asChild key={link.href} size="sm" variant="ghost">
                <Link
                  className={cn(pathname === link.href && "bg-accent")}
                  href={link.href}
                >
                  {getLinkLabel(link)}
                </Link>
              </Button>
            ))}
            <Button
              aria-label="Alternar tema"
              onClick={toggleTheme}
              size="icon"
              title="Alternar tema"
              type="button"
              variant="outline"
            >
              <ThemeToggleIcon />
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Button
              aria-label="Alternar tema"
              onClick={toggleTheme}
              size="icon"
              title="Alternar tema"
              type="button"
              variant="outline"
            >
              <ThemeToggleIcon />
            </Button>
            <Button
              aria-expanded={menuOpen}
              aria-label="Abrir menu"
              onClick={() => setMenuOpen((open) => !open)}
              size="sm"
              type="button"
              variant="outline"
            >
              Menu
            </Button>
          </div>
        </div>
        {menuOpen ? (
          <nav className="mx-auto grid w-full max-w-6xl gap-2 px-6 pb-4 md:hidden">
            {links.map((link) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                href={link.href}
                key={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {getLinkLabel(link)}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-2">
          <div className="space-y-3">
            <Link className="flex items-center gap-3" href="/">
              <BrandLogo
                darkLogoUrl={settings.darkLogoUrl}
                imageClassName="h-16 w-40 shrink-0 border-0 bg-transparent object-contain p-0 shadow-none ring-0 sm:h-[72px] sm:w-64"
                logoUrl={settings.logoUrl}
                textClassName="font-semibold"
                tradeName={settings.tradeName}
              />
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
          aria-label="Abrir conversa no WhatsApp"
          className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          href={whatsappHref}
          rel="noreferrer"
          target="_blank"
          title="WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      ) : null}
    </>
  );
}
