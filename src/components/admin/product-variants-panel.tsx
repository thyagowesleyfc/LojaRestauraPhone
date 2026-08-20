/* eslint-disable @next/next/no-img-element */
import {
  createProductVariantAction,
  deleteProductVariantAction,
  updateProductVariantAction
} from "@/actions/variants";
import { Button } from "@/components/ui/button";
import { suggestSku } from "@/lib/sku";

type CategoryCharacteristic = {
  characteristicId: string;
  required: boolean;
  displayOrder: number;
  characteristic: {
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      active: boolean;
    }>;
  };
};

type ProductVariant = {
  id: string;
  sku: string;
  active: boolean;
  values: Array<{
    characteristicId: string;
    characteristicOptionId: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    displayOrder: number;
  }>;
};

type ProductVariantsPanelProps = {
  product: {
    id: string;
    description: string;
  };
  categoryCharacteristics: CategoryCharacteristic[];
  variants: ProductVariant[];
};

function getSelectedOptionId(
  variant: ProductVariant | undefined,
  characteristicId: string
) {
  return (
    variant?.values.find((value) => value.characteristicId === characteristicId)
      ?.characteristicOptionId ?? ""
  );
}

function VariantSelectors({
  categoryCharacteristics,
  variant
}: {
  categoryCharacteristics: CategoryCharacteristic[];
  variant?: ProductVariant;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categoryCharacteristics.map((item) => (
        <label key={item.characteristicId} className="space-y-2 text-sm">
          <span className="font-medium">
            {item.characteristic.name}
            {item.required ? " *" : ""}
          </span>
          <select
            name={`variantOption:${item.characteristicId}`}
            required={item.required}
            defaultValue={getSelectedOptionId(variant, item.characteristicId)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">{item.required ? "Selecione" : "Nao usar"}</option>
            {item.characteristic.options.map((option) => (
              <option key={option.id} value={option.id} disabled={!option.active}>
                {option.name}
                {option.active ? "" : " (inativa)"}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

export function ProductVariantsPanel({
  product,
  categoryCharacteristics,
  variants
}: ProductVariantsPanelProps) {
  const canCreateVariants = categoryCharacteristics.length > 0;

  return (
    <section className="space-y-5 rounded-lg border border-border p-5">
      <div>
        <h2 className="text-xl font-semibold">Variantes e SKUs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada SKU usa o preco do produto e possui sua propria galeria de imagens.
        </p>
      </div>

      {canCreateVariants ? (
        <form action={createProductVariantAction} className="space-y-4 rounded-lg border border-border p-4">
          <input type="hidden" name="productId" value={product.id} />
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm">
              <span className="font-medium">SKU</span>
              <input
                name="sku"
                type="text"
                maxLength={80}
                placeholder={suggestSku(product.description, ["valor"])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium md:pb-2">
              <input
                name="active"
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-input"
              />
              Ativo
            </label>
          </div>
          <VariantSelectors categoryCharacteristics={categoryCharacteristics} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Imagens do SKU</span>
              <input
                name="variantImages"
                type="file"
                multiple
                required
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Textos alt das novas imagens</span>
              <input
                name="variantImageAlt"
                type="text"
                maxLength={160}
                placeholder="Opcional; use uma entrada por envio quando necessario"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Use JPG, PNG, WEBP ou AVIF. Cada SKU deve ter de 1 a 6 imagens.
          </p>
          <Button type="submit">Criar SKU</Button>
        </form>
      ) : (
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Configure caracteristicas na categoria do produto antes de criar SKUs.
        </p>
      )}

      <div className="space-y-4">
        {variants.map((variant) => (
          <article key={variant.id} className="space-y-4 rounded-lg border border-border p-4">
            <form action={updateProductVariantAction} className="space-y-4">
              <input type="hidden" name="variantId" value={variant.id} />
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">SKU</span>
                  <input
                    name="sku"
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={variant.sku}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium md:pb-2">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={variant.active}
                    className="size-4 rounded border-input"
                  />
                  Ativo
                </label>
              </div>

              <VariantSelectors
                categoryCharacteristics={categoryCharacteristics}
                variant={variant}
              />

              {variant.images.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {variant.images.map((image) => (
                    <div key={image.id} className="rounded-lg border border-border p-3">
                      <img
                        alt={image.altText ?? variant.sku}
                        className="aspect-video w-full rounded-md object-cover"
                        src={image.url}
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="font-medium">Ordem</span>
                          <input
                            name={`variantImageOrder:${image.id}`}
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
                            name={`variantImageAlt:${image.id}`}
                            type="text"
                            maxLength={160}
                            defaultValue={image.altText ?? ""}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          />
                        </label>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-sm text-destructive">
                        <input
                          name="removeVariantImageId"
                          type="checkbox"
                          value={image.id}
                          className="size-4 rounded border-input"
                        />
                        Remover imagem
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Novas imagens</span>
                  <input
                    name="variantImages"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Textos alt das novas imagens</span>
                  <input
                    name="variantImageAlt"
                    type="text"
                    maxLength={160}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>
              </div>

              <Button type="submit">Atualizar SKU</Button>
            </form>
            <form action={deleteProductVariantAction}>
              <input type="hidden" name="variantId" value={variant.id} />
              <Button type="submit" size="sm" variant="destructive">
                Excluir SKU
              </Button>
            </form>
          </article>
        ))}
        {variants.length === 0 ? (
          <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Nenhum SKU cadastrado para este produto.
          </p>
        ) : null}
      </div>
    </section>
  );
}