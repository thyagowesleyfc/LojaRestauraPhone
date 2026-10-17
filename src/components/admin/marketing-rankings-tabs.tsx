"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export type MarketingRankingRow = {
  count: number;
  href?: string;
  id: string;
  label: string;
};

export type MarketingOrderRankingRow = MarketingRankingRow & {
  units: number;
};

export type MarketingCampaignRankingRow = {
  count: number;
  id: string;
  source: string;
  medium: string;
  campaign: string;
};

type MarketingRankingsTabsProps = {
  campaigns: MarketingCampaignRankingRow[];
  cartAdditions: number;
  categories: MarketingRankingRow[];
  integrations: ReactNode;
  linkClicks: number;
  links: MarketingRankingRow[];
  products: {
    converted: MarketingOrderRankingRow[];
    ordered: MarketingOrderRankingRow[];
    viewed: MarketingRankingRow[];
  };
  promotions: {
    converted: MarketingOrderRankingRow[];
    ordered: MarketingOrderRankingRow[];
    viewed: MarketingRankingRow[];
  };
  searches: {
    noResults: MarketingRankingRow[];
    top: MarketingRankingRow[];
  };
  searchMetrics: {
    noResults: number;
    searched: number;
  };
};

type RankingTab =
  | "campaigns"
  | "categories"
  | "integrations"
  | "links"
  | "products"
  | "promotions"
  | "searches";

const tabs: { id: RankingTab; label: string }[] = [
  { id: "products", label: "Produtos" },
  { id: "promotions", label: "Promoções" },
  { id: "categories", label: "Categorias" },
  { id: "links", label: "Links" },
  { id: "searches", label: "Pesquisas" },
  { id: "campaigns", label: "Campanhas UTMs" },
  { id: "integrations", label: "Integrações" }
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function MetricSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <strong className="mt-2 block font-mono text-2xl font-semibold">
        {formatNumber(value)}
      </strong>
    </div>
  );
}

function RankingTable({
  emptyMessage,
  rows,
  valueLabel
}: {
  emptyMessage: string;
  rows: MarketingRankingRow[];
  valueLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={row.id}>
              <td className="px-4 py-3">
                {row.href ? (
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href={row.href}
                  >
                    {row.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{row.label}</span>
                )}
              </td>
              <td className="px-4 py-3">{formatNumber(row.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRankingTable({
  emptyMessage,
  rows
}: {
  emptyMessage: string;
  rows: MarketingOrderRankingRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Pedidos</th>
            <th className="px-4 py-3 font-medium">Unidades</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={row.id}>
              <td className="px-4 py-3">
                {row.href ? (
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href={row.href}
                  >
                    {row.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{row.label}</span>
                )}
              </td>
              <td className="px-4 py-3">{formatNumber(row.count)}</td>
              <td className="px-4 py-3">{formatNumber(row.units)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignTable({ rows }: { rows: MarketingCampaignRankingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Nenhum evento com UTM no período.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Mídia</th>
            <th className="px-4 py-3 font-medium">Campanha</th>
            <th className="px-4 py-3 font-medium">Eventos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={row.id}>
              <td className="px-4 py-3">{row.source}</td>
              <td className="px-4 py-3">{row.medium}</td>
              <td className="px-4 py-3">{row.campaign}</td>
              <td className="px-4 py-3">{formatNumber(row.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarketingRankingsTabs({
  campaigns,
  cartAdditions,
  categories,
  integrations,
  linkClicks,
  links,
  products,
  promotions,
  searches,
  searchMetrics
}: MarketingRankingsTabsProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>("products");

  return (
    <section className="space-y-6">
      <div className="border-b border-border" role="tablist" aria-label="Rankings de marketing">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                aria-controls={`marketing-ranking-panel-${tab.id}`}
                aria-selected={isActive}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                id={`marketing-ranking-tab-${tab.id}`}
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
        aria-labelledby={`marketing-ranking-tab-${activeTab}`}
        id={`marketing-ranking-panel-${activeTab}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === "products" ? (
          <div className="space-y-6">
            <div className="max-w-sm">
              <MetricSummary
                label="Total de itens adicionados aos carrinhos"
                value={cartAdditions}
              />
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Mais vistos</h3>
                <RankingTable
                  emptyMessage="Nenhuma visualização de produto no período."
                  rows={products.viewed}
                  valueLabel="Sessões"
                />
              </section>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Mais pedidos</h3>
                <OrderRankingTable
                  emptyMessage="Nenhum pedido de produto no período."
                  rows={products.ordered}
                />
              </section>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Mais convertidos</h3>
                <OrderRankingTable
                  emptyMessage="Nenhum produto convertido no período."
                  rows={products.converted}
                />
              </section>
            </div>
          </div>
        ) : null}

        {activeTab === "promotions" ? (
          <div className="grid gap-6 xl:grid-cols-3">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Mais vistas</h3>
              <RankingTable
                emptyMessage="Nenhuma visualização de promoção no período."
                rows={promotions.viewed}
                valueLabel="Sessões"
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Mais pedidas</h3>
              <OrderRankingTable
                emptyMessage="Nenhum pedido de promoção no período."
                rows={promotions.ordered}
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Mais convertidas</h3>
              <OrderRankingTable
                emptyMessage="Nenhuma promoção convertida no período."
                rows={promotions.converted}
              />
            </section>
          </div>
        ) : null}

        {activeTab === "categories" ? (
          <section className="max-w-3xl space-y-3">
            <h3 className="text-lg font-semibold">Categorias mais vistas</h3>
            <RankingTable
              emptyMessage="Nenhuma visualização de categoria no período."
              rows={categories}
              valueLabel="Sessões"
            />
          </section>
        ) : null}

        {activeTab === "links" ? (
          <div className="space-y-6">
            <div className="max-w-sm">
              <MetricSummary label="Total de links acessados" value={linkClicks} />
            </div>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Links mais acessados</h3>
              <RankingTable
                emptyMessage="Nenhum acesso a link no período."
                rows={links}
                valueLabel="Acessos"
              />
            </section>
          </div>
        ) : null}

        {activeTab === "searches" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricSummary
                label="Sessões com buscas"
                value={searchMetrics.searched}
              />
              <MetricSummary
                label="Sessões com busca sem resultado"
                value={searchMetrics.noResults}
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Mais realizadas</h3>
                <RankingTable
                  emptyMessage="Nenhuma busca registrada no período."
                  rows={searches.top}
                  valueLabel="Buscas"
                />
              </section>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Sem resultado</h3>
                <RankingTable
                  emptyMessage="Nenhuma busca sem resultado no período."
                  rows={searches.noResults}
                  valueLabel="Ocorrências"
                />
              </section>
            </div>
          </div>
        ) : null}

        {activeTab === "campaigns" ? (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Campanhas UTM</h3>
            <CampaignTable rows={campaigns} />
          </section>
        ) : null}

        {activeTab === "integrations" ? (
          <section className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Integrações</h3>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Configure marcadores externos de marketing. Os eventos continuam
                sendo registrados internamente e também são encaminhados aos
                providers ativos.
              </p>
            </div>
            {integrations}
          </section>
        ) : null}
      </div>
    </section>
  );
}
