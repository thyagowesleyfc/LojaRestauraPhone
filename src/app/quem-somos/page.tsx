import { getStoreSettings } from "@/lib/store-settings";

export default async function AboutPage() {
  const settings = await getStoreSettings();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Quem somos
        </p>
        <h1 className="text-4xl font-semibold">{settings.tradeName}</h1>
      </header>
      <section className="space-y-4 rounded-lg border border-border p-6">
        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {settings.aboutText ||
            "Conteudo institucional ainda nao configurado."}
        </p>
      </section>
      <section className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
        {settings.phone ? <p>Telefone: {settings.phone}</p> : null}
        {settings.email ? <p>E-mail: {settings.email}</p> : null}
        {settings.address ? <p>Endereco: {settings.address}</p> : null}
        {settings.cnpj ? <p>CNPJ: {settings.cnpj}</p> : null}
      </section>
      {settings.mapEmbedUrl ? (
        <iframe
          className="aspect-video w-full rounded-lg border border-border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={settings.mapEmbedUrl}
          title={`Mapa ${settings.tradeName}`}
        />
      ) : null}
    </main>
  );
}
