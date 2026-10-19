"use client";

import { useState, type ReactNode } from "react";

type ProductEditTab = "info" | "images" | "skus";

type ProductEditTabsProps = {
  children: ReactNode;
  hasSkus: boolean;
};

const baseTabs: Array<{ id: ProductEditTab; label: string }> = [
  { id: "info", label: "Informações" },
  { id: "images", label: "Imagens" }
];

export function ProductEditTabs({
  children,
  hasSkus
}: ProductEditTabsProps) {
  const tabs = hasSkus
    ? [...baseTabs, { id: "skus" as const, label: "SKU" }]
    : baseTabs;
  const [activeTab, setActiveTab] = useState<ProductEditTab>("info");

  return (
    <div className="group space-y-6" data-active-tab={activeTab}>
      <div
        aria-label="Seções do produto"
        className="border-b border-border"
        role="tablist"
      >
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                aria-controls={`product-edit-panel-${tab.id}`}
                aria-selected={isActive}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                id={`product-edit-tab-${tab.id}`}
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

      {children}
    </div>
  );
}
