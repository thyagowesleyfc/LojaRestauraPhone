import Link from "next/link";

const cards = [
  {
    href: "/admin/categorias",
    title: "Categorias",
    description: "Cadastre, ordene e ative as secoes do catalogo."
  },
  {
    href: "/admin/produtos",
    title: "Produtos",
    description: "Cadastre itens, precos, imagens e disponibilidade publica."
  },
  {
    href: "/admin/promocoes",
    title: "Promocoes",
    description: "Configure descontos por categoria e combos."
  },
  {
    href: "/admin/banners",
    title: "Banners",
    description: "Gerencie imagens, links e ordem de exibicao."
  },
  {
    href: "/admin/configuracoes",
    title: "Configuracoes",
    description: "Atualize loja, WhatsApp, logo, cores e mapa."
  }
];

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Painel administrativo</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Gerencie o catalogo publico e as configuracoes da RestauraPhone.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            className="rounded-lg border border-border p-5 transition-colors hover:bg-accent"
            href={card.href}
          >
            <h2 className="font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}