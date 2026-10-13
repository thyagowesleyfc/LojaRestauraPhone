import { updateStoreSettingsAction } from "@/actions/settings";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-semibold sm:text-3xl">
          Configurações
        </h1>
        <AdminDashboardLink />
      </div>
      <FormError message={erro} />
      <StoreSettingsForm
        action={updateStoreSettingsAction}
        passwordError={erroSenha}
        passwordSuccess={passwordSuccess}
        settings={settings ?? fallbackSettings}
      />
    </section>
  );
}
