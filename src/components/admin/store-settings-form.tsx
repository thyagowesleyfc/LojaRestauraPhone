"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";

import { changeAdminPasswordAction } from "@/actions/auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";

type StoreSettingsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  passwordError?: string;
  passwordSuccess?: string;
  settings: {
    tradeName: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    mapEmbedUrl: string;
    aboutText: string;
    privacyPageContent: string;
    whatsappNumber: string;
    whatsappInitialMessage: string;
    bannerTransitionSeconds: number;
    offerCountdownHeadline: string;
    offerCountdownLink: string;
    offerCountdownDurationSeconds: number;
    offerCountdownBackgroundColor: string;
    logoUrl: string | null;
    darkLogoUrl: string | null;
    lightPrimaryColor: string;
    lightBackgroundColor: string;
    lightTextColor: string;
    darkPrimaryColor: string;
    darkBackgroundColor: string;
    darkTextColor: string;
  };
};

type SettingsTab =
  | "senha"
  | "dados"
  | "privacidade"
  | "whatsapp"
  | "tema"
  | "outros";

const settingsTabs: { id: SettingsTab; label: string }[] = [
  { id: "senha", label: "Senha" },
  { id: "dados", label: "Dados Institucionais" },
  { id: "privacidade", label: "Privacidade" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tema", label: "Tema" },
  { id: "outros", label: "Outros" }
];

export function StoreSettingsForm({
  action,
  passwordError,
  passwordSuccess,
  settings
}: StoreSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    passwordError || passwordSuccess ? "senha" : "dados"
  );
  const countdownHours = Math.floor(
    settings.offerCountdownDurationSeconds / 3600
  );
  const countdownMinutes = Math.floor(
    (settings.offerCountdownDurationSeconds % 3600) / 60
  );
  const countdownSeconds = settings.offerCountdownDurationSeconds % 60;
  const showSettingsForm = activeTab !== "senha";

  return (
    <div className="space-y-6">
      <div
        aria-label="Seções de configuração"
        className="border-b border-border"
        role="tablist"
      >
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {settingsTabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                aria-controls={`settings-panel-${tab.id}`}
                aria-selected={isActive}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                id={`settings-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-labelledby="settings-tab-senha"
        className={activeTab === "senha" ? "block" : "hidden"}
        id="settings-panel-senha"
        role="tabpanel"
      >
        <PasswordSettingsPanel error={passwordError} success={passwordSuccess} />
      </div>

      <form
        action={action}
        className={showSettingsForm ? "space-y-6" : "hidden"}
      >
        <SettingsPanel activeTab={activeTab} tabId="dados">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextField
              name="tradeName"
              label="Nome fantasia"
              defaultValue={settings.tradeName}
              required
            />
            <TextField name="cnpj" label="CNPJ" defaultValue={settings.cnpj} />
            <TextField
              name="phone"
              label="Telefone"
              defaultValue={settings.phone}
            />
            <TextField
              name="email"
              label="E-mail"
              defaultValue={settings.email}
              required
              type="email"
            />
          </div>
          <TextField
            name="address"
            label="Endereço"
            defaultValue={settings.address}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="aboutText">
              Quem somos
            </label>
            <textarea
              id="aboutText"
              name="aboutText"
              rows={8}
              defaultValue={settings.aboutText}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mapEmbedUrl">
              URL do mapa
            </label>
            <textarea
              id="mapEmbedUrl"
              name="mapEmbedUrl"
              rows={3}
              defaultValue={settings.mapEmbedUrl}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </SettingsPanel>

        <SettingsPanel activeTab={activeTab} tabId="privacidade">
          <RichTextEditor
            defaultValue={settings.privacyPageContent}
            label="Texto da página"
            name="privacyPageContent"
          />
        </SettingsPanel>

        <SettingsPanel activeTab={activeTab} tabId="whatsapp">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextField
              name="whatsappNumber"
              label="Número internacional"
              defaultValue={settings.whatsappNumber}
            />
            <TextField
              name="whatsappInitialMessage"
              label="Mensagem inicial"
              defaultValue={settings.whatsappInitialMessage}
              required
            />
          </div>
        </SettingsPanel>

        <SettingsPanel activeTab={activeTab} tabId="tema">
          <div className="grid gap-5 lg:grid-cols-2">
            <LogoUploadField
              hintId="light-logo-upload-hint"
              imageUrl={settings.logoUrl}
              label="Logo tema claro"
              name="logo"
              tradeName={settings.tradeName}
            />
            <LogoUploadField
              hintId="dark-logo-upload-hint"
              imageUrl={settings.darkLogoUrl}
              label="Logo tema escuro"
              name="darkLogo"
              tradeName={settings.tradeName}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ColorField
              name="lightPrimaryColor"
              label="Primária clara"
              defaultValue={settings.lightPrimaryColor}
            />
            <ColorField
              name="lightBackgroundColor"
              label="Fundo claro"
              defaultValue={settings.lightBackgroundColor}
            />
            <ColorField
              name="lightTextColor"
              label="Texto claro"
              defaultValue={settings.lightTextColor}
            />
            <ColorField
              name="darkPrimaryColor"
              label="Primária escura"
              defaultValue={settings.darkPrimaryColor}
            />
            <ColorField
              name="darkBackgroundColor"
              label="Fundo escuro"
              defaultValue={settings.darkBackgroundColor}
            />
            <ColorField
              name="darkTextColor"
              label="Texto escuro"
              defaultValue={settings.darkTextColor}
            />
          </div>
        </SettingsPanel>

        <SettingsPanel activeTab={activeTab} tabId="outros">
          <div className="max-w-xs space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="bannerTransitionSeconds"
            >
              Intervalo do carrossel (segundos)
            </label>
            <input
              id="bannerTransitionSeconds"
              name="bannerTransitionSeconds"
              type="number"
              min={3}
              max={30}
              step={1}
              required
              defaultValue={settings.bannerTransitionSeconds}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Padrão recomendado: 5 segundos. Use entre 3 e 30 segundos.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <TextField
              name="offerCountdownHeadline"
              label="Headline"
              defaultValue={settings.offerCountdownHeadline}
            />
            <TextField
              name="offerCountdownLink"
              label="Link"
              defaultValue={settings.offerCountdownLink}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
            <NumberField
              name="offerCountdownHours"
              label="Horas"
              defaultValue={countdownHours}
              min={0}
              max={168}
            />
            <NumberField
              name="offerCountdownMinutes"
              label="Minutos"
              defaultValue={countdownMinutes}
              min={0}
              max={59}
            />
            <NumberField
              name="offerCountdownSeconds"
              label="Segundos"
              defaultValue={countdownSeconds}
              min={0}
              max={59}
            />
            <ColorField
              name="offerCountdownBackgroundColor"
              label="Cor da faixa"
              defaultValue={settings.offerCountdownBackgroundColor}
            />
          </div>
        </SettingsPanel>

        <ConfirmSubmitButton
          confirmLabel="Confirmar atualização"
          description="Deseja confirmar a atualização das configurações da loja?"
          title="Confirmar atualização das configurações?"
        >
          Salvar configurações
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}

function SettingsPanel({
  activeTab,
  children,
  tabId
}: {
  activeTab: SettingsTab;
  children: ReactNode;
  tabId: SettingsTab;
}) {
  return (
    <section
      aria-labelledby={`settings-tab-${tabId}`}
      className={activeTab === tabId ? "space-y-5" : "hidden"}
      id={`settings-panel-${tabId}`}
      role="tabpanel"
    >
      {children}
    </section>
  );
}

function PasswordSettingsPanel({
  error,
  success
}: {
  error?: string;
  success?: string;
}) {
  return (
    <form
      action={changeAdminPasswordAction}
      className="grid gap-4 sm:max-w-xl"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="currentPassword">
          Senha atual
        </label>
        <input
          autoComplete="current-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          id="currentPassword"
          name="currentPassword"
          required
          type="password"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="newPassword">
            Nova senha
          </label>
          <input
            autoComplete="new-password"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            id="newPassword"
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirmar nova senha
          </label>
          <input
            autoComplete="new-password"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            id="confirmPassword"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </div>
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
          {success}
        </p>
      ) : null}
      <Button className="w-full sm:w-fit" type="submit">
        Salvar nova senha
      </Button>
    </form>
  );
}

function LogoUploadField({
  hintId,
  imageUrl,
  label,
  name,
  tradeName
}: {
  hintId: string;
  imageUrl: string | null;
  label: string;
  name: string;
  tradeName: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      {imageUrl ? (
        <img
          alt={`${label} - ${tradeName}`}
          className="h-24 w-full border-0 bg-transparent object-contain p-0 shadow-none ring-0"
          src={imageUrl}
        />
      ) : null}
      <ImageUploadInput
        id={name}
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif"
        aria-describedby={hintId}
      />
      <p className="text-xs leading-5 text-muted-foreground" id={hintId}>
        Tamanho ideal: 512 x 160 px, horizontal e com fundo transparente.
      </p>
    </div>
  );
}
function TextField({
  name,
  label,
  defaultValue,
  required = false,
  type = "text"
}: {
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  min,
  max
}: {
  name: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={min}
        max={max}
        step={1}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}

function ColorField({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="color"
        required
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-input bg-background px-2 py-1 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}
