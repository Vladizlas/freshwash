import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import { createSession } from "@/lib/auth";

// Fitur login: verifikasi bcrypt lalu buat cookie sesi HTTP-only.
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    await initDb();
    const form = await req.formData();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
    }
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    return NextResponse.redirect(new URL("/", req.url), 303);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
  }
}
