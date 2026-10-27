import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { initDb } from "@/lib/db";
import { Customer, LaundryTransaction } from "@/models";
import { customerSchema } from "@/lib/validators";
import { requireUser } from "@/lib/http";

// Fitur API pelanggan: PUT memperbarui dan DELETE menghapus jika tidak punya transaksi.
export const runtime = "nodejs";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    await initDb();
    const { id } = await params;
    const customer = await Customer.findByPk(Number(id));
    if (!customer)
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 },
      );
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { message: "Data tidak valid." },
        { status: 400 },
      );
    if (
      await Customer.findOne({
        where: { phone: parsed.data.phone, id: { [Op.ne]: customer.id } },
      })
    )
      return NextResponse.json(
        { message: "Nomor WhatsApp sudah terdaftar." },
        { status: 409 },
      );
    await customer.update({
      ...parsed.data,
      address: parsed.data.address || null,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Gagal memperbarui pelanggan." },
      { status: 500 },
    );
  }
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  // Form edit HTML menggunakan POST; data diperbarui lewat helper yang sama.
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    await initDb();
    const { id } = await ctx.params;
    const customer = await Customer.findByPk(Number(id));
    if (!customer)
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 },
      );
    const form = await req.formData();
    const parsed = customerSchema.safeParse({
      name: form.get("name"),
      phone: form.get("phone"),
      address: form.get("address"),
    });
    if (!parsed.success)
      return NextResponse.json(
        { message: "Data tidak valid." },
        { status: 400 },
      );
    if (
      await Customer.findOne({
        where: { phone: parsed.data.phone, id: { [Op.ne]: customer.id } },
      })
    )
      return NextResponse.json(
        { message: "Nomor WhatsApp sudah terdaftar." },
        { status: 409 },
      );
    await customer.update({
      ...parsed.data,
      address: parsed.data.address || null,
    });
    return NextResponse.redirect(new URL("/customers", req.url), 303);
  } catch {
    return NextResponse.json(
      { message: "Gagal memperbarui pelanggan." },
      { status: 500 },
    );
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    await initDb();
    const { id } = await params;
    const customer = await Customer.findByPk(Number(id));
    if (!customer)
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 },
      );
    if (await LaundryTransaction.count({ where: { customerId: customer.id } }))
      return NextResponse.json(
        { message: "Pelanggan memiliki transaksi dan tidak bisa dihapus." },
        { status: 409 },
      );
    await customer.destroy();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Gagal menghapus pelanggan." },
      { status: 500 },
    );
  }
}
