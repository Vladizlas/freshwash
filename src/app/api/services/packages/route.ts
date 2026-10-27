import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { LaundryPackage } from "@/models";
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
    const serviceType = String(form.get("serviceType") || "kiloan");
    const speed = String(form.get("speed") || "regular");
    const pricePerKg = Number(form.get("pricePerKg"));
    const estimatedHours = Number(form.get("estimatedHours"));
    if (
      name.length < 3 ||
      !["kiloan", "dry_clean"].includes(serviceType) ||
      !["regular", "express"].includes(speed) ||
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
    await LaundryPackage.create({
      name,
      serviceType: serviceType as "kiloan" | "dry_clean",
      speed: speed as "regular" | "express",
      pricePerKg,
      estimatedHours,
      active: true,
    });
    return NextResponse.redirect(
      new URL("/services?created=package", req.url),
      303,
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Gagal menyimpan paket. Pastikan nama paket unik." },
      { status: 400 },
    );
  }
}
