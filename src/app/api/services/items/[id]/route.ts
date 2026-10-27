import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { UnitItem } from "@/models";
import { requireUser } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin")
    return NextResponse.json(
      { message: "Akses khusus Administrator/Pemilik." },
      { status: 403 },
    );
  try {
    await initDb();
    const { id } = await params;
    const item = await UnitItem.findByPk(Number(id));
    if (!item)
      return NextResponse.json(
        { message: "Item tidak ditemukan." },
        { status: 404 },
      );
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const price = Number(form.get("price"));
    const active = String(form.get("active")) === "true";
    if (name.length < 2 || !Number.isFinite(price) || price <= 0)
      return NextResponse.json(
        { message: "Data item tidak valid." },
        { status: 400 },
      );
    await item.update({ name, price, active });
    return NextResponse.redirect(
      new URL("/services?updated=item", req.url),
      303,
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal memperbarui item." },
      { status: 400 },
    );
  }
}
