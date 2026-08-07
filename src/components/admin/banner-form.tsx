/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";

type BannerFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  banner?: {
    id: string;
    imageUrl: string;
    mobileImageUrl: string | null;
    redirectUrl: string;
    altText: string | null;
    displayOrder: number;
    active: boolean;
  };
  submitLabel: string;
};

export function BannerForm({ action, banner, submitLabel }: BannerFormProps) {
  return (
    <form action={action} className="max-w-3xl space-y-6">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      {banner ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Imagem desktop atual</p>
            <img
              alt={banner.altText ?? "Banner desktop"}
              className="aspect-[16/6] w-full rounded-lg border border-border object-cover"
              src={banner.imageUrl}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Imagem mobile atual</p>
            {banner.mobileImageUrl ? (
              <img
                alt={banner.altText ?? "Banner mobile"}
                className="aspect-[4/5] w-full rounded-lg border border-border object-cover"
                src={banner.mobileImageUrl}
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-lg border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
                Sem imagem mobile. O site usa a imagem desktop como fallback.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="desktopImage">
            {banner ? "Nova imagem desktop" : "Imagem desktop"}
          </label>
          <input
            id="desktopImage"
            name="desktopImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required={!banner}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Recomendado: 1920x720px, horizontal, com area segura para texto a
            esquerda.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="mobileImage">
            {banner ? "Nova imagem mobile" : "Imagem mobile"}
          </label>
          <input
            id="mobileImage"
            name="mobileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required={!banner}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Recomendado: 900x1200px, vertical, mantendo assunto visivel atras
            do texto.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="redirectUrl">
          Link de destino
        </label>
        <input
          id="redirectUrl"
          name="redirectUrl"
          type="text"
          required
          maxLength={500}
          defaultValue={banner?.redirectUrl}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="altText">
            Headline / texto alternativo
          </label>
          <input
            id="altText"
            name="altText"
            type="text"
            maxLength={160}
            placeholder="Ex.: Promocao de capas e carregadores"
            defaultValue={banner?.altText ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Este texto aparece como headline do slide no hero e tambem descreve
            a imagem para acessibilidade.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="displayOrder">
            Ordem
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={banner?.displayOrder ?? 0}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={banner?.active ?? true}
          className="size-4 rounded border-input"
        />
        Ativo
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}