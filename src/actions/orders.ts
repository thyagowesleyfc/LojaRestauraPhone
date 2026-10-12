"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function redirectWithOrderError(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

export async function markOrderConversionAction(formData: FormData) {
  await requireAdminUser();

  const code = getStringValue(formData, "code").trim().toUpperCase();

  if (!/^[A-Z0-9]{10}$/.test(code)) {
    redirectWithOrderError("/admin/pedidos", "Pedido inválido.");
  }

  const order = await prisma.customerOrder.findUnique({
    where: { code },
    select: { code: true, converted: true }
  });

  if (!order) {
    redirectWithOrderError("/admin/pedidos", "Pedido não encontrado.");
  }

  if (!order.converted) {
    await prisma.customerOrder.update({
      where: { code },
      data: { converted: true }
    });
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${code}`);
  revalidatePath("/admin/marketing");
  redirect(`/admin/pedidos/${code}?sucesso=conversao`);
}