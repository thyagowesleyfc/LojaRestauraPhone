import { updateStoreSettingsAction } from "@/actions/settings";
import { FormError } from "@/components/admin/form-error";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { prisma } from "@/lib/prisma";

type SettingsPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

const fallbackSettings = {
  tradeName: "RestauraPhone",
  cnpj: "",
  phone: "",
  email: "admin@example.com",
  address: "",
  mapEmbedUrl: "",
  aboutText: "",
  whatsappNumber: "",
  whatsappInitialMessage: "Ola, tenho interesse em um pedido.",
  bannerTransitionSeconds: 5,
  logoUrl: null,
  lightPrimaryColor: "#16a34a",
  lightBackgroundColor: "#ffffff",
  lightTextColor: "#171717",
  darkPrimaryColor: "#22c55e",
  darkBackgroundColor: "#171717",
  darkTextColor: "#fafafa"
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ erro }, settings] = await Promise.all([
    searchParams,
    prisma.storeSettings.findUnique({ where: { id: 1 } })
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Configuracoes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize dados institucionais, WhatsApp, logo, tema e mapa.
        </p>
      </div>
      <FormError message={erro} />
      <StoreSettingsForm
        action={updateStoreSettingsAction}
        settings={settings ?? fallbackSettings}
      />
    </section>
  );
}
