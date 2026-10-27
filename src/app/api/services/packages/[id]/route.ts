import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { LaundryPackage } from "@/models";
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
    const item = await LaundryPackage.findByPk(Number(id));
    if (!item)
      return NextResponse.json(
        { message: "Paket tidak ditemukan." },
        { status: 404 },
      );
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const pricePerKg = Number(form.get("pricePerKg"));
    const estimatedHours = Number(form.get("estimatedHours"));
    const active = String(form.get("active")) === "true";
    if (
      name.length < 3 ||
      !Number.isFinite(pricePerKg) ||
      pricePerKg <= 0 ||
      !Number.isInteger(estimatedHours) ||
      estimatedHours < 1 ||
      estimatedHours > 720
    )
      return NextResponse.json(
        { message: "Data paket tidak valid." },
        { status: 400 },
      );
    await item.update({ name, pricePerKg, estimatedHours, active });
    return NextResponse.redirect(
      new URL("/services?updated=package", req.url),
      303,
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal memperbarui paket." },
      { status: 400 },
    );
  }
}
