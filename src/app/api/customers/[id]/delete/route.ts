import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { Customer, LaundryTransaction } from "@/models";
import { requireUser } from "@/lib/http";

// Fitur hapus dari form HTML; mencegah penghapusan pelanggan yang sudah memiliki transaksi.
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    await initDb();
    const { id } = await params;
    const customer = await Customer.findByPk(Number(id));
    if (
      customer &&
      !(await LaundryTransaction.count({ where: { customerId: customer.id } }))
    )
      await customer.destroy();
    return NextResponse.redirect(new URL("/customers", req.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/customers", req.url), 303);
  }
}
