import { Button } from "@/components/ui/button";

type CategoryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  category?: {
    id: string;
    name: string;
    displayOrder: number;
    active: boolean;
  };
  submitLabel: string;
};

export function CategoryForm({
  action,
  category,
  submitLabel
}: CategoryFormProps) {
  return (
    <form action={action} className="max-w-xl space-y-5">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={category?.name}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
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
          defaultValue={category?.displayOrder ?? 0}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={category?.active ?? true}
          className="size-4 rounded border-input"
        />
        Ativa
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
