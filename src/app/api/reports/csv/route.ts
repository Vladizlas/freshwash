import { Op } from "sequelize";
import { initDb } from "@/lib/db";
import {
  Customer,
  LaundryPackage,
  LaundryTransaction,
  LaundryOrderItem,
} from "@/models";
import { requireUser } from "@/lib/http";
export const runtime = "nodejs";
const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
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
    const rows: unknown[][] = [
      [
        "No. Nota",
        "Tgl Masuk",
        "Pelanggan",
        "Paket",
        "Berat/Item",
        "Estimasi Jadi",
        "Grand Total",
        "Status Bayar",
        "Status Cucian",
        "Total Kiloan",
        "Total Satuan",
        "Diskon",
        "Dibayar",
        "Sisa",
      ],
    ];
    for (const t of txs) {
      const customer = (t as unknown as { customer?: Customer }).customer;
      const pkg = (t as unknown as { package?: LaundryPackage }).package;
      const items =
        (t as unknown as { items?: LaundryOrderItem[] }).items || [];
      rows.push([
        t.invoiceNumber,
        new Date(t.intakeAt).toLocaleString("id-ID"),
        customer?.name || "",
        pkg?.name || "Cucian satuan",
        t.weightKg
          ? `${t.weightKg} kg`
          : items.map((i) => `${i.itemName} x ${i.quantity}`).join("; "),
        t.estimatedFinish
          ? new Date(t.estimatedFinish).toLocaleString("id-ID")
          : "",
        Number(t.totalAmount),
        t.paymentStatus,
        t.processStatus,
        Number(t.totalKiloan),
        Number(t.totalUnit),
        Number(t.discount),
        Number(t.paidAmount),
        Number(t.totalAmount) - Number(t.paidAmount),
      ]);
    }
    const csv =
      "\uFEFF" + rows.map((row) => row.map(esc).join(",")).join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=laporan-freshwash.csv",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Gagal membuat laporan", { status: 500 });
  }
}
