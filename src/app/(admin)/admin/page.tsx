import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Painel administrativo</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Gerencie categorias, produtos e promocoes do catalogo publico da
        RestauraPhone.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          className="rounded-lg border border-border p-5 transition-colors hover:bg-accent"
          href="/admin/categorias"
        >
          <h2 className="font-semibold">Categorias</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Cadastre, ordene e ative as secoes do catalogo.
          </p>
        </Link>
        <Link
          className="rounded-lg border border-border p-5 transition-colors hover:bg-accent"
          href="/admin/produtos"
        >
          <h2 className="font-semibold">Produtos</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Cadastre itens, precos, imagens e disponibilidade publica.
          </p>
        </Link>
        <Link
          className="rounded-lg border border-border p-5 transition-colors hover:bg-accent"
          href="/admin/promocoes"
        >
          <h2 className="font-semibold">Promocoes</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Configure descontos por categoria e combos.
          </p>
        </Link>
      </div>
    </section>
  );
}