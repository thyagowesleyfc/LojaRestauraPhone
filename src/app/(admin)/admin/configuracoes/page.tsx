import { updateStoreSettingsAction } from "@/actions/settings";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { FormError } from "@/components/admin/form-error";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { DEFAULT_PRIVACY_PAGE_CONTENT } from "@/lib/privacy-content";
import { prisma } from "@/lib/prisma";

type SettingsPageProps = {
  searchParams: Promise<{
    erro?: string;
    erroSenha?: string;
    sucesso?: string;
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
  privacyPageContent: DEFAULT_PRIVACY_PAGE_CONTENT,
  whatsappNumber: "",
  whatsappInitialMessage: "Olá, tenho interesse em um pedido.",
  bannerTransitionSeconds: 5,
  offerCountdownHeadline: "",
  offerCountdownLink: "",
  offerCountdownDurationSeconds: 0,
  offerCountdownBackgroundColor: "#16a34a",
  logoUrl: null,
  darkLogoUrl: null,
  lightPrimaryColor: "#16a34a",
  lightBackgroundColor: "#ffffff",
  lightTextColor: "#171717",
  darkPrimaryColor: "#22c55e",
  darkBackgroundColor: "#171717",
  darkTextColor: "#fafafa"
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ erro, erroSenha, sucesso }, settings] = await Promise.all([
    searchParams,
    prisma.storeSettings.findUnique({ where: { id: 1 } })
  ]);
  const passwordSuccess =
    sucesso === "senha" ? "Senha administrativa alterada com sucesso." : undefined;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Configurações</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize dados institucionais, WhatsApp, logo, tema, mapa e senha.
        </p>
        <div className="mt-4">
          <AdminDashboardLink />
        </div>
      </div>
      <FormError message={erro} />
      <AdminPasswordForm error={erroSenha} success={passwordSuccess} />
      <StoreSettingsForm
        action={updateStoreSettingsAction}
        settings={settings ?? fallbackSettings}
      />
    </section>
  );
}