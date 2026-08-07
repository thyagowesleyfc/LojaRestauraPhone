import type { Metadata } from "next";

import { PublicChrome } from "@/components/public/public-chrome";
import { getStoreSettings } from "@/lib/store-settings";
import { getStoreThemeStyle } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestauraPhone",
  description: "Catalogo publico e painel administrativo da RestauraPhone."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html lang="pt-BR">
      <body style={getStoreThemeStyle(settings)}>
        {children}
        <PublicChrome settings={settings} />
      </body>
    </html>
  );
}