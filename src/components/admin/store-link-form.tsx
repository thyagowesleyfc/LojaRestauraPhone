/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";

type StoreLinkFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  link?: {
    id: string;
    title: string;
    description: string;
    redirectUrl: string;
    imageUrl: string | null;
    displayOrder: number;
    active: boolean;
  };
  submitLabel: string;
};

export function StoreLinkForm({ action, link, submitLabel }: StoreLinkFormProps) {
  return (
    <form action={action} className="max-w-3xl space-y-6">
      {link ? <input name="id" type="hidden" value={link.id} /> : null}

      {link?.imageUrl ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Imagem atual</p>
          <img
            alt={link.title}
            className="size-20 rounded-lg border border-border bg-card object-cover"
            src={link.imageUrl}
          />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Título
          </label>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={link?.title ?? ""}
            id="title"
            maxLength={80}
            name="title"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="displayOrder">
            Ordem
          </label>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={link?.displayOrder ?? 0}
            id="displayOrder"
            min={0}
            name="displayOrder"
            required
            step={1}
            type="number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="redirectUrl">
          Link de Redirecionamento
        </label>
        <input
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          defaultValue={link?.redirectUrl ?? ""}
          id="redirectUrl"
          maxLength={500}
          name="redirectUrl"
          placeholder="https://... ou /promocoes"
          required
          type="text"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Descrição
        </label>
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          defaultValue={link?.description ?? ""}
          id="description"
          maxLength={500}
          name="description"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="image">
          Imagem Link
        </label>
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          id="image"
          name="image"
          type="file"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          PNG, WEBP, JPG ou AVIF até 5 MB. Use imagens quadradas para ícones.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          className="size-4 rounded border-input"
          defaultChecked={link?.active ?? true}
          name="active"
          type="checkbox"
        />
        Ativo
      </label>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}