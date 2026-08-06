import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-3xl space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            RestauraPhone
          </p>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Fundacao tecnica do catalogo
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Aplicacao Next.js preparada para catalogo publico, carrinho via
            WhatsApp e painel administrativo nas proximas fases.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Base criada</Button>
          <Button variant="outline">Fase 0</Button>
        </div>
      </section>
    </main>
  );
}
