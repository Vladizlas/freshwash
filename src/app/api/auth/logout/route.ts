import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

// Fitur logout: hapus cookie sesi dan arahkan kembali ke halaman login.
export async function POST(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url), 303);
}
