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
  };
};

const links = [
  { href: "/promocoes", label: "Promocoes" },
  { href: "/categorias", label: "Categorias" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/carrinho", label: "Carrinho" }
];

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
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={settings.tradeName}
                className="h-9 max-w-28 shrink-0 object-contain"
                src={settings.logoUrl}
              />
            ) : null}
            <span className="truncate font-semibold">{settings.tradeName}</span>
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
            <Button onClick={toggleTheme} size="sm" type="button" variant="outline">
              Tema
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Button onClick={toggleTheme} size="sm" type="button" variant="outline">
              Tema
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
