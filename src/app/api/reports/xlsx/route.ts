import { Op } from "sequelize";
import * as XLSX from "xlsx";
import { initDb } from "@/lib/db";
import {
  Customer,
  LaundryPackage,
  LaundryTransaction,
  LaundryOrderItem,
} from "@/models";
import { requireUser } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin")
    return new Response("Akses khusus Administrator/Pemilik.", { status: 403 });
  try {
    await initDb();
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const packageId = url.searchParams.get("packageId");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const where: Record<string, unknown> = {};
    if (packageId) where.packageId = Number(packageId);
    if (paymentStatus && ["paid", "partial", "unpaid"].includes(paymentStatus))
      where.paymentStatus = paymentStatus;
    if (from || to)
      where.createdAt = {
        ...(from ? { [Op.gte]: new Date(`${from}T00:00:00`) } : {}),
        ...(to ? { [Op.lte]: new Date(`${to}T23:59:59.999`) } : {}),
      };
    const txs = await LaundryTransaction.findAll({
      where,
      include: [
        { model: Customer, as: "customer" },
        { model: LaundryPackage, as: "package" },
        { model: LaundryOrderItem, as: "items" },
      ],
      order: [["createdAt", "DESC"]],
    });
    const rows = txs.map((t) => {
      const customer = (t as unknown as { customer?: Customer }).customer;
      const pkg = (t as unknown as { package?: LaundryPackage }).package;
      const items =
        (t as unknown as { items?: LaundryOrderItem[] }).items || [];
      return {
        "No. Nota": t.invoiceNumber,
        "Tgl Masuk": new Date(t.intakeAt).toLocaleString("id-ID"),
        Pelanggan: customer?.name || "",
        Paket: pkg?.name || "Cucian satuan",
        "Berat/Item": t.weightKg
          ? `${t.weightKg} kg`
          : items.map((i) => `${i.itemName} x ${i.quantity}`).join("; "),
        "Estimasi Jadi": t.estimatedFinish
          ? new Date(t.estimatedFinish).toLocaleString("id-ID")
          : "",
        "Grand Total": Number(t.totalAmount),
        "Status Bayar": t.paymentStatus,
        "Status Cucian": t.processStatus,
        "Total Kiloan": Number(t.totalKiloan),
        "Total Satuan": Number(t.totalUnit),
        Diskon: Number(t.discount),
        Dibayar: Number(t.paidAmount),
        Sisa: Number(t.totalAmount) - Number(t.paidAmount),
      };
    });
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Laporan Laundry");
    const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=laporan-freshwash.xlsx",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Gagal membuat laporan", { status: 500 });
  }
}
