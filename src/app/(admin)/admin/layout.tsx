import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              RestauraPhone
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Sair
            </Button>
          </form>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-2 px-6 pb-4 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">Painel</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/categorias">Categorias</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/produtos">Produtos</Link>
          </Button>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}