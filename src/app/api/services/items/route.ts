import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { UnitItem } from "@/models";
import { requireUser } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin")
    return NextResponse.json(
      { message: "Akses khusus Administrator/Pemilik." },
      { status: 403 },
    );
  try {
    await initDb();
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const price = Number(form.get("price"));
    if (
      name.length < 2 ||
      name.length > 100 ||
      !Number.isFinite(price) ||
      price <= 0
    )
      return NextResponse.json(
        { message: "Nama item atau harga tidak valid." },
        { status: 400 },
      );
    await UnitItem.create({ name, price, active: true });
    return NextResponse.redirect(
      new URL("/services?created=item", req.url),
      303,
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal menyimpan item. Pastikan nama item unik." },
      { status: 400 },
    );
  }
}
