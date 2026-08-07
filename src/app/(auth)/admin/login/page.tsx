import { redirect } from "next/navigation";

import { getCurrentAdminUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentAdminUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            RestauraPhone
          </p>
          <h1 className="text-3xl font-semibold">Painel administrativo</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Acesse com o administrador inicial configurado no seed.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
