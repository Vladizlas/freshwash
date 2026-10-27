import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { LaundryTransaction, Payment, sequelize } from "@/models";
import { requireUser } from "@/lib/http";

// Fitur pembayaran: catat pembayaran, hitung total bayar, dan perbarui status secara transaksional.
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  await initDb();
  const dbTx = await sequelize.transaction();
  try {
    const { id } = await params;
    const tx = await LaundryTransaction.findByPk(Number(id), {
      transaction: dbTx,
      lock: dbTx.LOCK.UPDATE,
    });
    if (!tx) {
      await dbTx.rollback();
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan." },
        { status: 404 },
      );
    }
    const form = await req.formData();
    const amount = Number(form.get("amount"));
    const method = String(form.get("method") || "cash");
    const remaining = Number(tx.totalAmount) - Number(tx.paidAmount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > remaining ||
      !["cash", "transfer", "qris"].includes(method)
    ) {
      await dbTx.rollback();
      return NextResponse.json(
        { message: "Jumlah atau metode pembayaran tidak valid." },
        { status: 400 },
      );
    }
    await Payment.create(
      {
        transactionId: tx.id,
        amount,
        method: method as "cash" | "transfer" | "qris",
        receivedBy: auth.user!.id,
      },
      { transaction: dbTx },
    );
    const paid = Number(tx.paidAmount) + amount;
    await tx.update(
      {
        paidAmount: paid,
        paymentStatus: paid >= Number(tx.totalAmount) ? "paid" : "partial",
      },
      { transaction: dbTx },
    );
    await dbTx.commit();
    return NextResponse.redirect(
      new URL(`/transactions/${tx.id}`, req.url),
      303,
    );
  } catch (e) {
    try {
      await dbTx.rollback();
    } catch (rollbackError) {
      console.error("Rollback transaksi gagal:", rollbackError);
    }
  }
}
