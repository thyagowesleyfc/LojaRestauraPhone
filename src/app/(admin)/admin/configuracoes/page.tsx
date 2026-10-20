import { updateStoreSettingsAction } from "@/actions/settings";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { FormError } from "@/components/admin/form-error";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { replaceLegacyStoreName } from "@/lib/privacy-content";
import { getStoreSettings } from "@/lib/store-settings";

type SettingsPageProps = {
  searchParams: Promise<{
    erro?: string;
    erroSenha?: string;
    sucesso?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ erro, erroSenha, sucesso }, settings] = await Promise.all([
    searchParams,
    getStoreSettings()
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
        settings={{
          ...settings,
          privacyPageContent: replaceLegacyStoreName(
            settings.privacyPageContent,
            settings.tradeName
          )
        }}
      />
    </section>
  );
}
