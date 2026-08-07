/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { centsToInputValue } from "@/lib/formatters";

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  product?: {
    id: string;
    description: string;
    specification: string;
    categoryId: string;
    priceInCents: number;
    active: boolean;
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      displayOrder: number;
    }>;
  };
  submitLabel: string;
};

export function ProductForm({
  action,
  categories,
  product,
  submitLabel
}: ProductFormProps) {
  return (
    <form action={action} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Descricao curta
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            maxLength={140}
            defaultValue={product?.description}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Selecione
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="price">
          Preco
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          required
          defaultValue={
            product ? centsToInputValue(product.priceInCents) : undefined
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="specification">
          Especificacao
        </label>
        <textarea
          id="specification"
          name="specification"
          required
          rows={7}
          maxLength={4000}
          defaultValue={product?.specification}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      {product?.images.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Imagens atuais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.images.map((image) => (
              <div key={image.id} className="rounded-lg border border-border p-3">
                <img
                  alt={image.altText ?? product.description}
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
          {product ? "Novas imagens" : "Imagens"}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!product}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          Use JPG, PNG, WEBP ou AVIF. O produto deve ter de 1 a 6 imagens.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={product?.active ?? true}
          className="size-4 rounded border-input"
        />
        Ativo
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
