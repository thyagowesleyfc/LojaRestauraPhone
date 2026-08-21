import type { Metadata } from "next";

import { PublicChrome } from "@/components/public/public-chrome";
import { getActiveMarketingIntegrations } from "@/lib/marketing-integrations";
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
  const [settings, marketingIntegrations] = await Promise.all([
    getStoreSettings(),
    getActiveMarketingIntegrations()
  ]);

  return (
    <html lang="pt-BR" style={getStoreThemeStyle(settings)}>
      <body>
        <PublicChrome
          marketingIntegrations={marketingIntegrations}
          settings={settings}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}