import { NextResponse } from "next/server";

import { authenticateAdmin, createAdminSession } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const admin = await authenticateAdmin(parsed.data);

  if (!admin) {
    return NextResponse.json(
      { error: "E-mail ou senha invalidos." },
      { status: 401 }
    );
  }

  await createAdminSession(admin.id);

  return NextResponse.json({
    user: admin
  });
}
