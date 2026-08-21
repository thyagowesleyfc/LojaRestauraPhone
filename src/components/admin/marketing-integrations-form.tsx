import { updateMarketingIntegrationsAction } from "@/actions/marketing";
import { Button } from "@/components/ui/button";
import type { getMarketingIntegrations } from "@/lib/marketing-integrations";

type MarketingIntegrationsFormProps = {
  integrations: Awaited<ReturnType<typeof getMarketingIntegrations>>;
};

export function MarketingIntegrationsForm({
  integrations
}: MarketingIntegrationsFormProps) {
  return (
    <form action={updateMarketingIntegrationsAction} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {integrations.map((item) => (
          <section
            className="space-y-4 rounded-lg border border-border bg-card p-4"
            key={item.provider}
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    className="size-4 rounded border-input accent-primary"
                    defaultChecked={item.integration?.active ?? false}
                    name={item.activeFieldName}
                    type="checkbox"
                  />
                  Ativo
                </label>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Identificador</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={item.integration?.identifier ?? ""}
                name={item.fieldName}
                placeholder={item.placeholder}
                type="text"
              />
            </label>
          </section>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Somente IDs estruturados sao aceitos. O painel nao salva JavaScript livre.
      </p>
      <Button type="submit">Salvar integracoes</Button>
    </form>
  );
}