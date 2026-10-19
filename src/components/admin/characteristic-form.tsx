import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";

const newOptionRows = [0, 1, 2];

type CharacteristicFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  characteristic?: {
    id: string;
    name: string;
    slug: string;
    displayOrder: number;
    active: boolean;
    options: Array<{
      id: string;
      name: string;
      slug: string;
      displayOrder: number;
      active: boolean;
    }>;
  };
  submitLabel: string;
};

export function CharacteristicForm({
  action,
  characteristic,
  submitLabel
}: CharacteristicFormProps) {
  return (
    <form action={action} className="space-y-6">
      {characteristic ? (
        <input type="hidden" name="id" value={characteristic.id} />
      ) : null}
      <div className="grid gap-5">
        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={characteristic?.name}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={characteristic?.active ?? true}
          className="size-4 rounded border-input"
        />
        Ativa
      </label>

      {characteristic?.options.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Opções existentes</h2>
          <div className="grid gap-3">
            {characteristic.options.map((option) => (
              <div
                key={option.id}
                className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1fr_auto_auto] lg:items-end"
              >
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Nome</span>
                  <input
                    name={`optionName:${option.id}`}
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={option.name}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium lg:pb-2">
                  <input
                    name={`optionActive:${option.id}`}
                    type="checkbox"
                    defaultChecked={option.active}
                    className="size-4 rounded border-input"
                  />
                  Ativa
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-destructive lg:pb-2">
                  <input
                    name="removeOptionId"
                    type="checkbox"
                    value={option.id}
                    className="size-4 rounded border-input"
                  />
                  Remover
                </label>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Novas opções</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use linhas vazias quando não precisar adicionar mais valores.
          </p>
        </div>
        <div className="grid gap-3">
          {newOptionRows.map((row) => (
            <div
              key={row}
              className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1fr_auto] lg:items-end"
            >
              <label className="space-y-1 text-sm">
                <span className="font-medium">Nome</span>
                <input
                  name="newOptionName"
                  type="text"
                  maxLength={80}
                  placeholder="Preto"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium lg:pb-2">
                <input
                  name="newOptionActive"
                  type="checkbox"
                  value={row}
                  defaultChecked
                  className="size-4 rounded border-input"
                />
                Ativa
              </label>
            </div>
          ))}
        </div>
      </section>

      {characteristic ? (
        <ConfirmSubmitButton
          confirmLabel="Confirmar edição"
          description={`Deseja confirmar a edição da característica ${characteristic.name}?`}
          title="Confirmar edição de característica?"
        >
          {submitLabel}
        </ConfirmSubmitButton>
      ) : (
        <Button type="submit">{submitLabel}</Button>
      )}
    </form>
  );
}
