import Link from "next/link";

import { updateCategoryCharacteristicsAction } from "@/actions/characteristics";
import { Button } from "@/components/ui/button";

type CategoryCharacteristicsFormProps = {
  category: {
    id: string;
  };
  characteristics: Array<{
    id: string;
    name: string;
    active: boolean;
    displayOrder: number;
    options: Array<{ id: string }>;
  }>;
  selectedCharacteristics: Array<{
    characteristicId: string;
    displayOrder: number;
    required: boolean;
  }>;
};

export function CategoryCharacteristicsForm({
  category,
  characteristics,
  selectedCharacteristics
}: CategoryCharacteristicsFormProps) {
  const selectedById = new Map(
    selectedCharacteristics.map((item) => [item.characteristicId, item])
  );

  return (
    <section className="space-y-4 rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Caracteristicas da categoria</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina quais caracteristicas podem formar SKUs dos produtos desta categoria.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/caracteristicas/nova">Nova caracteristica</Link>
        </Button>
      </div>

      {characteristics.length > 0 ? (
        <form action={updateCategoryCharacteristicsAction} className="space-y-4">
          <input type="hidden" name="categoryId" value={category.id} />
          <div className="grid gap-3">
            {characteristics.map((characteristic) => {
              const selected = selectedById.get(characteristic.id);

              return (
                <div
                  key={characteristic.id}
                  className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1fr_120px_auto] lg:items-end"
                >
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      name="characteristicId"
                      type="checkbox"
                      value={characteristic.id}
                      defaultChecked={Boolean(selected)}
                      className="mt-1 size-4 rounded border-input"
                    />
                    <span>
                      <span className="block font-medium">{characteristic.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {characteristic.options.length} opcoes ·{" "}
                        {characteristic.active ? "ativa" : "inativa"}
                      </span>
                    </span>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">Ordem</span>
                    <input
                      name={`categoryCharacteristicOrder:${characteristic.id}`}
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={selected?.displayOrder ?? characteristic.displayOrder}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium lg:pb-2">
                    <input
                      name={`categoryCharacteristicRequired:${characteristic.id}`}
                      type="checkbox"
                      defaultChecked={selected?.required ?? true}
                      className="size-4 rounded border-input"
                    />
                    Obrigatoria
                  </label>
                </div>
              );
            })}
          </div>
          <Button type="submit">Salvar caracteristicas</Button>
        </form>
      ) : (
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Cadastre caracteristicas antes de vincula-las a categorias.
        </p>
      )}
    </section>
  );
}