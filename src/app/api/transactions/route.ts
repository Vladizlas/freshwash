import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import {
  Customer,
  LaundryTransaction,
  LaundryPackage,
  LaundryOrderItem,
  UnitItem,
  Payment,
  ProcessHistory,
  sequelize,
} from "@/models";
import { transactionSchema } from "@/lib/validators";
import { generateInvoiceNumber } from "@/lib/invoice";
import { requireUser } from "@/lib/http";

export const runtime = "nodejs";
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  await initDb();
  const rows = await LaundryTransaction.findAll({
    include: [
      { model: Customer, as: "customer" },
      { model: LaundryPackage, as: "package" },
      { model: LaundryOrderItem, as: "items" },
    ],
    order: [["createdAt", "DESC"]],
  });
  return NextResponse.json(rows);
}
export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    await initDb();
    const form = await req.formData();
    const packageValue = String(form.get("packageId") || "").trim();
    const rawItemIds = form.getAll("itemId").map(String);
    const rawQuantities = form.getAll("quantity").map((v) => Number(v));
    const selectedItems = rawItemIds
      .map((id, i) => ({ id, quantity: rawQuantities[i] || 1 }))
      .filter((row) => row.id.trim());
    const itemIds = selectedItems.map((row) => row.id);
    const itemQuantities = selectedItems.map((row) => row.quantity);
    const parsed = transactionSchema.safeParse({
      customerId: form.get("customerId"),
      packageId: packageValue ? packageValue : undefined,
      weightKg: String(form.get("weightKg") || "").trim()
        ? form.get("weightKg")
        : undefined,
      discount: form.get("discount") || 0,
      notes: form.get("notes") || "",
      paymentChoice: form.get("paymentChoice") || "unpaid",
      initialPayment: form.get("initialPayment") || 0,
      itemIds,
      itemQuantities,
    });
    if (!parsed.success)
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message || "Data transaksi tidak valid.",
        },
        { status: 400 },
      );
    if (!(await Customer.findByPk(parsed.data.customerId)))
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 400 },
      );
    const pkg = parsed.data.packageId
      ? await LaundryPackage.findOne({
          where: { id: parsed.data.packageId, active: true },
        })
      : null;
    if (parsed.data.packageId && !pkg)
      return NextResponse.json(
        { message: "Paket layanan tidak ditemukan atau tidak aktif." },
        { status: 400 },
      );
    const itemRows = [];
    for (let i = 0; i < parsed.data.itemIds.length; i++) {
      const item = await UnitItem.findOne({
        where: { id: parsed.data.itemIds[i], active: true },
      });
      if (!item)
        return NextResponse.json(
          { message: "Item satuan tidak ditemukan atau tidak aktif." },
          { status: 400 },
        );
      const quantity = parsed.data.itemQuantities[i] || 1;
      itemRows.push({
        item,
        quantity,
        subtotal: Number(item.price) * quantity,
      });
    }
    const weight = parsed.data.weightKg ?? 0;
    const kiloTotal = pkg ? weight * Number(pkg.pricePerKg) : 0;
    const unitTotal = itemRows.reduce((sum, row) => sum + row.subtotal, 0);
    const total = Math.max(0, kiloTotal + unitTotal - parsed.data.discount);
    if (total <= 0)
      return NextResponse.json(
        { message: "Total transaksi harus lebih dari Rp0." },
        { status: 400 },
      );
    if (parsed.data.initialPayment > total)
      return NextResponse.json(
        { message: "Pembayaran awal tidak boleh melebihi total." },
        { status: 400 },
      );
    const initialPayment =
      parsed.data.paymentChoice === "paid" ? total : parsed.data.initialPayment;
    const paymentMethod = String(form.get("method") || "cash");
    if (
      initialPayment > 0 &&
      !["cash", "transfer", "qris"].includes(paymentMethod)
    )
      return NextResponse.json(
        { message: "Metode pembayaran tidak valid." },
        { status: 400 },
      );
    const invoiceNumber = await generateInvoiceNumber();
    const now = new Date();
    const estimatedFinish = pkg
      ? new Date(now.getTime() + Number(pkg.estimatedHours) * 3600000)
      : new Date(now.getTime() + 48 * 3600000);
    const dbTx = await sequelize.transaction();
    try {
      const created = await LaundryTransaction.create(
        {
          invoiceNumber,
          customerId: parsed.data.customerId,
          packageId: pkg?.id ?? null,
          serviceType: pkg ? pkg.serviceType : "unit",
          weightKg: pkg ? weight : null,
          totalKiloan: kiloTotal,
          totalUnit: unitTotal,
          discount: parsed.data.discount,
          totalAmount: total,
          paidAmount: initialPayment,
          paymentStatus:
            initialPayment >= total
              ? "paid"
              : initialPayment > 0
                ? "partial"
                : "unpaid",
          processStatus: "waiting",
          notes: parsed.data.notes || null,
          intakeAt: now,
          estimatedFinish,
          createdBy: auth.user!.id,
        },
        { transaction: dbTx },
      );
      for (const row of itemRows)
        await LaundryOrderItem.create(
          {
            transactionId: created.id,
            unitItemId: row.item.id,
            itemName: row.item.name,
            unitPrice: Number(row.item.price),
            quantity: row.quantity,
            subtotal: row.subtotal,
          },
          { transaction: dbTx },
        );
      await ProcessHistory.create(
        {
          transactionId: created.id,
          status: "waiting",
          changedBy: auth.user!.id,
          note: "Transaksi dibuat",
        },
        { transaction: dbTx },
      );
      if (initialPayment > 0)
        await Payment.create(
          {
            transactionId: created.id,
            amount: initialPayment,
            method: paymentMethod as "cash" | "transfer" | "qris",
            receivedBy: auth.user!.id,
          },
          { transaction: dbTx },
        );
      await dbTx.commit();
      return NextResponse.redirect(
        new URL(`/transactions/${created.id}`, req.url),
        303,
      );
    } catch (e) {
      await dbTx.rollback();
      throw e;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Gagal membuat transaksi." },
      { status: 500 },
    );
  }
}
