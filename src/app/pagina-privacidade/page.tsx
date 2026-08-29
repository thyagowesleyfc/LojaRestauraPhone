import type { Metadata } from "next";

import { getPrivacyPageContent } from "@/lib/privacy-content";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: `${settings.tradeName} | Página de privacidade`,
    description: `Informações de privacidade e cookies da ${settings.tradeName}.`
  };
}

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const content = getPrivacyPageContent(settings.privacyPageContent);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <article className="space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Privacidade
          </p>
          <h1 className="text-4xl font-semibold">Página de privacidade</h1>
        </header>
        <div
          className="space-y-4 text-sm leading-7 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:leading-7 [&_strong]:font-semibold [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </main>
  );
}