import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import { requireUser } from "@/lib/http";

// Role hanya dapat diubah oleh Administrator/Pemilik.
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const target = await User.findByPk(Number(id));
    if (!target)
      return NextResponse.json(
        { message: "Akun tidak ditemukan." },
        { status: 404 },
      );
    const form = await req.formData();
    const role = String(form.get("role") ?? "");
    if (!(["admin", "cashier"] as string[]).includes(role)) {
      return NextResponse.json(
        { message: "Role tidak valid." },
        { status: 400 },
      );
    }
    if (target.id === auth.user!.id && role !== "admin") {
      return NextResponse.json(
        { message: "Role akun yang sedang digunakan tidak dapat diturunkan." },
        { status: 409 },
      );
    }
    await target.update({ role: role as "admin" | "cashier" });
    return NextResponse.redirect(new URL("/users?updated=1", req.url), 303);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengubah role." },
      { status: 500 },
    );
  }
}
