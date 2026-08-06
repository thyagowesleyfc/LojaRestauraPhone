import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "loja-restauraphone",
    timestamp: new Date().toISOString()
  });
}
