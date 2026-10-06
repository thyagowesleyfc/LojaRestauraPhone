import Link from "next/link";

const cards = [
  {
    href: "/admin/categorias",
    title: "Categorias",
    description: "Cadastre, ordene e ative as seções do catálogo."
  },
  {
    href: "/admin/produtos",
    title: "Produtos",
    description: "Cadastre itens, preços, imagens e disponibilidade pública."
  },
  {
    href: "/admin/caracteristicas",
    title: "Características",
    description: "Defina atributos e opções usados nas variações dos produtos."
  },
  {
    href: "/admin/promocoes",
    title: "Promoções",
    description: "Configure descontos por categoria e combos."
  },
  {
    href: "/admin/banners",
    title: "Banners",
    description: "Gerencie imagens, links e ordem de exibição."
  },
  {
    href: "/admin/links",
    title: "Meus Links",
    description: "Monte a página pública de links com botões e métricas."
  },
  {
    href: "/admin/configuracoes",
    title: "Configurações",
    description: "Atualize loja, WhatsApp, logo, cores e mapa."
  },
  {
    href: "/admin/pedidos",
    title: "Pedidos",
    description: "Consulte pedidos enviados pelo WhatsApp."
  },
  {
    href: "/admin/marketing",
    title: "Marketing",
    description: "Acompanhe visitas, buscas, funil e campanhas UTM."
  }
];

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Painel administrativo</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Gerencie o catálogo público e as configurações da RestauraPhone.
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