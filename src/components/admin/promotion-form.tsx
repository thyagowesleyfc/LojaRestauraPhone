/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { centsToInputValue } from "@/lib/formatters";

type PromotionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  products: Array<{
    id: string;
    description: string;
    priceInCents: number;
  }>;
  promotion?: {
    id: string;
    type: PromotionType;
    description: string;
    categoryId: string | null;
    percentage: number | null;
    comboPriceInCents: number | null;
    active: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    products: Array<{
      productId: string;
    }>;
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      displayOrder: number;
    }>;
  };
  submitLabel: string;
};

function dateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

export function PromotionForm({
  action,
  categories,
  products,
  promotion,
  submitLabel
}: PromotionFormProps) {
  const selectedProductIds = new Set(
    promotion?.products.map((product) => product.productId) ?? []
  );

  return (
    <form action={action} className="space-y-6">
      {promotion ? (
        <input type="hidden" name="id" value={promotion.id} />
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Descricao
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            maxLength={180}
            defaultValue={promotion?.description}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="type">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={promotion?.type ?? PromotionType.CATEGORY_PERCENTAGE}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value={PromotionType.CATEGORY_PERCENTAGE}>
              Percentual por categoria
            </option>
            <option value={PromotionType.PRODUCT_COMBO}>Combo</option>
          </select>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={promotion?.categoryId ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="percentage">
            Percentual
          </label>
          <input
            id="percentage"
            name="percentage"
            type="number"
            min={1}
            max={99}
            step={1}
            defaultValue={promotion?.percentage ?? undefined}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="comboPrice">
            Preco do combo
          </label>
          <input
            id="comboPrice"
            name="comboPrice"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={
              promotion?.comboPriceInCents
                ? centsToInputValue(promotion.comboPriceInCents)
                : undefined
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="startsAt">
            Inicio
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="date"
            defaultValue={dateInputValue(promotion?.startsAt)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="endsAt">
            Fim
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="date"
            defaultValue={dateInputValue(promotion?.endsAt)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Produtos do combo</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {products.map((product) => (
            <label
              key={product.id}
              className="flex items-start gap-2 rounded-md border border-border p-3 text-sm"
            >
              <input
                name="productId"
                type="checkbox"
                value={product.id}
                defaultChecked={selectedProductIds.has(product.id)}
                className="mt-1 size-4 rounded border-input"
              />
              <span>{product.description}</span>
            </label>
          ))}
        </div>
      </section>
      {promotion?.images.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Imagens atuais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {promotion.images.map((image) => (
              <div key={image.id} className="rounded-lg border border-border p-3">
                <img
                  alt={image.altText ?? promotion.description}
                  className="aspect-video w-full rounded-md object-cover"
                  src={image.url}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">Ordem</span>
                    <input
                      name={`imageOrder:${image.id}`}
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={image.displayOrder}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">Texto alt</span>
                    <input
                      name={`imageAlt:${image.id}`}
                      type="text"
                      maxLength={160}
                      defaultValue={image.altText ?? ""}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    name="removeImageId"
                    type="checkbox"
                    value={image.id}
                    className="size-4 rounded border-input"
                  />
                  Remover imagem
                </label>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="images">
          {promotion ? "Novas imagens" : "Imagens"}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!promotion}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={promotion?.active ?? true}
          className="size-4 rounded border-input"
        />
        Ativa
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
