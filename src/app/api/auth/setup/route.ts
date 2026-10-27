import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { User } from "@/models";

// Fitur setup admin pertama: hanya berjalan jika tabel users masih kosong.
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    await initDb();
    if (await User.count())
      return NextResponse.redirect(new URL("/login", req.url));
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");
    if (name.length < 2 || !email.includes("@") || password.length < 8) {
      return NextResponse.json(
        { message: "Data tidak valid. Password minimal 8 karakter." },
        { status: 400 },
      );
    }
    await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });
    return NextResponse.redirect(new URL("/login", req.url), 303);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal membuat admin. Periksa database." },
      { status: 500 },
    );
  }
}
