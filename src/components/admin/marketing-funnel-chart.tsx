"use client";

export type FunnelMetric = {
  description: string;
  kind: "action" | "conversion" | "session";
  label: string;
  value: number;
};

type MarketingFunnelChartProps = {
  endDate: string;
  metrics: FunnelMetric[];
  startDate: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getMetricWidth(metric: FunnelMetric, metrics: FunnelMetric[]) {
  const groupValues = metrics
    .filter((item) => item.kind === metric.kind)
    .map((item) => item.value);
  const maxValue = Math.max(...groupValues, 0);

  if (maxValue === 0) {
    return 72;
  }

  return Math.max(42, Math.round((metric.value / maxValue) * 100));
}

function getMetricClasses(kind: FunnelMetric["kind"], index: number) {
  if (kind === "conversion") {
    return "bg-primary text-primary-foreground";
  }

  if (kind === "action") {
    return index % 2 === 0
      ? "bg-accent text-accent-foreground"
      : "bg-secondary text-secondary-foreground";
  }

  return index % 2 === 0
    ? "bg-primary text-primary-foreground"
    : "bg-primary/80 text-primary-foreground";
}

export function MarketingFunnelChart({
  endDate,
  metrics,
  startDate
}: MarketingFunnelChartProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Jornada de aquisição
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Acompanhe o caminho das sessões que entraram pela Home ou pela
              página de links até o pedido convertido.
            </p>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:min-w-[540px]"
            method="get"
          >
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Início</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={startDate}
                name="inicio"
                type="date"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Fim</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={endDate}
                name="fim"
                type="date"
              />
            </label>
            <button
              className="h-10 self-end rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              type="submit"
            >
              Atualizar
            </button>
          </form>
        </div>
      </header>

      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            Sessões e conversão
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent" />
            Ações no período
          </span>
          <span className="text-muted-foreground/80">
            Largura relativa ao grupo de cada métrica
          </span>
        </div>

        <ol
          aria-label="Funil de marketing"
          className="space-y-2.5"
        >
          {metrics.map((metric, index) => (
            <li key={metric.label}>
              <div className="flex justify-center">
                <div
                  className={`min-w-0 px-4 py-3 transition-[width,opacity] duration-300 sm:px-6 sm:py-4 ${getMetricClasses(
                    metric.kind,
                    index
                  )}`}
                  style={{
                    clipPath: "polygon(3% 0, 97% 0, 100% 100%, 0 100%)",
                    width: `${getMetricWidth(metric, metrics)}%`
                  }}
                >
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 sm:text-base">
                        {metric.label}
                      </p>
                      <p className="mt-0.5 text-xs opacity-80 sm:text-sm">
                        {metric.description}
                      </p>
                    </div>
                    <strong className="text-2xl font-semibold leading-none sm:text-3xl">
                      {formatNumber(metric.value)}
                    </strong>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
