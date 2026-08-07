/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";

type StoreSettingsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  settings: {
    tradeName: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    mapEmbedUrl: string;
    aboutText: string;
    whatsappNumber: string;
    whatsappInitialMessage: string;
    bannerTransitionSeconds: number;
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

export function StoreSettingsForm({
  action,
  settings
}: StoreSettingsFormProps) {
  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dados institucionais</h2>
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
          label="Endereco"
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
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hero e banners</h2>
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
            Padrao recomendado: 5 segundos. Use entre 3 e 30 segundos.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">WhatsApp</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <TextField
            name="whatsappNumber"
            label="Numero internacional"
            defaultValue={settings.whatsappNumber}
          />
          <TextField
            name="whatsappInitialMessage"
            label="Mensagem inicial"
            defaultValue={settings.whatsappInitialMessage}
            required
          />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Logos</h2>
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
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cores</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            name="lightPrimaryColor"
            label="Primaria clara"
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
            label="Primaria escura"
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
      </section>
      <Button type="submit">Salvar configuracoes</Button>
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
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        aria-describedby={hintId}
        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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