import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import { requireUser } from "@/lib/http";

// Hanya Administrator/Pemilik yang boleh mengelola akun pegawai.
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin") {
    return NextResponse.json(
      { message: "Akses khusus Administrator/Pemilik." },
      { status: 403 },
    );
  }
  await initDb();
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "createdAt"],
    order: [["name", "ASC"]],
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin") {
    return NextResponse.json(
      { message: "Akses khusus Administrator/Pemilik." },
      { status: 403 },
    );
  }
  try {
    await initDb();
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role") ?? "cashier");
    if (
      name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      !["admin", "cashier"].includes(role)
    ) {
      return NextResponse.json(
        { message: "Data tidak valid. Password minimal 8 karakter." },
        { status: 400 },
      );
    }
    if (await User.findOne({ where: { email } })) {
      return NextResponse.json(
        { message: "Email sudah digunakan." },
        { status: 409 },
      );
    }
    await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: role as "admin" | "cashier",
    });
    return NextResponse.redirect(new URL("/users?created=1", req.url), 303);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal membuat akun pegawai." },
      { status: 500 },
    );
  }
}
