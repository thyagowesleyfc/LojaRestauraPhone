"use client";

export type FunnelMetric = {
  label: string;
  value: number;
};

type FunnelDefinition = {
  description: string;
  metrics: FunnelMetric[];
  title: string;
  supportingMetric?: FunnelMetric;
};

type MarketingFunnelChartProps = {
  endDate: string;
  funnels: FunnelDefinition[];
  startDate: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0
  }).format(value);
}

function getBarPercent(value: number, baseValue: number) {
  if (baseValue <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / baseValue) * 100));
}

function getTransitionMessage(previous: number, current: number) {
  if (previous <= 0) {
    return "Sem sessões suficientes para comparar esta transição";
  }

  const difference = previous - current;

  if (difference > 0) {
    return `−${formatNumber(difference)} nesta transição (${formatPercent(
      (difference / previous) * 100
    )}%)`;
  }

  if (difference < 0) {
    return `+${formatNumber(Math.abs(difference))} registrados nesta etapa`;
  }

  return "Sem perda nesta transição";
}

function FunnelCard({
  description,
  metrics,
  supportingMetric,
  title
}: FunnelDefinition) {
  const baseValue = metrics[0]?.value ?? 0;

  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </header>

      <ol aria-label={title} className="mt-7 space-y-1">
        {metrics.map((metric, index) => {
          const percent = getBarPercent(metric.value, baseValue);
          const previousValue = metrics[index - 1]?.value;
          const showInlinePercent = percent >= 16;
          const hasDrop =
            previousValue !== undefined && metric.value < previousValue;

          return (
            <li key={metric.label}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-28 shrink-0 sm:w-36">
                  <p className="text-sm font-medium leading-5">{metric.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatNumber(metric.value)}
                  </p>
                </div>
                <div className="h-9 min-w-0 flex-1 overflow-hidden rounded-lg bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-lg bg-primary px-3 transition-[width] duration-300"
                    style={{ width: `${percent}%` }}
                  >
                    {showInlinePercent ? (
                      <span className="font-mono text-xs text-primary-foreground">
                        {formatPercent(percent)}%
                      </span>
                    ) : null}
                  </div>
                </div>
                {!showInlinePercent ? (
                  <span className="w-11 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {formatPercent(percent)}%
                  </span>
                ) : null}
              </div>
              {index > 0 ? (
                <p
                  className={`ml-28 py-1 text-xs sm:ml-40 ${
                    hasDrop ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {getTransitionMessage(previousValue ?? 0, metric.value)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {supportingMetric ? (
        <div className="mt-7 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Indicador relacionado
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">{supportingMetric.label}</p>
            <strong className="font-mono text-xl font-semibold">
              {formatNumber(supportingMetric.value)}
            </strong>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function MarketingFunnelChart({
  endDate,
  funnels,
  startDate
}: MarketingFunnelChartProps) {
  return (
    <section className="space-y-5">
      <header className="flex justify-end rounded-xl border border-border bg-card p-5 sm:p-6">
        <form
          className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:max-w-[540px]"
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
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {funnels.map((funnel) => (
          <FunnelCard key={funnel.title} {...funnel} />
        ))}
      </div>
    </section>
  );
}
