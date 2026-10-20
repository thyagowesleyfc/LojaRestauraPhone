import type { Metadata } from "next";

import { PublicChrome } from "@/components/public/public-chrome";
import { env } from "@/lib/env";
import { getActiveMarketingIntegrations } from "@/lib/marketing-integrations";
import { getStoreSettings } from "@/lib/store-settings";
import { getStoreThemeStyle } from "@/lib/theme";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: settings.tradeName,
    description: `Catálogo público e painel administrativo da ${settings.tradeName}.`
  };
}

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
          platformSignatureUrl={env.NEXT_PUBLIC_PLATFORM_SIGNATURE_URL}
          settings={settings}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
