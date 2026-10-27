import Link from "next/link";
import { redirect } from "next/navigation";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { LaundryTransaction, LaundryPackage, Customer } from "@/models";
const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default async function PrintReport({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    packageId?: string;
    paymentStatus?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");
  await initDb();
  const q = await searchParams;
  const from =
    q.from ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  const to = q.to || new Date().toISOString().slice(0, 10);
  const where: Record<string, unknown> = {
    createdAt: {
      [Op.gte]: new Date(`${from}T00:00:00`),
      [Op.lte]: new Date(`${to}T23:59:59.999`),
    },
  };
  if (q.packageId) where.packageId = Number(q.packageId);
  if (
    q.paymentStatus &&
    ["paid", "partial", "unpaid"].includes(q.paymentStatus)
  )
    where.paymentStatus = q.paymentStatus;
  const txs = await LaundryTransaction.findAll({
    where,
    include: [
      { model: Customer, as: "customer" },
      { model: LaundryPackage, as: "package" },
    ],
    order: [["createdAt", "DESC"]],
  });
  return (
    <main className="mx-auto max-w-5xl bg-white p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link href="/reports" className="text-sm text-cyan-700">
            ← Kembali ke laporan
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Laporan FreshWash</h1>
        </div>
        <p className="text-sm text-slate-500">
          Gunakan Ctrl+P atau Print lalu pilih “Save as PDF”.
        </p>
      </div>
      <h1 className="hidden text-2xl font-bold print:block">
        Laporan FreshWash
      </h1>
      <p className="mb-5 text-sm">
        Periode {from} sampai {to} · {txs.length} nota
      </p>
      <table className="w-full text-left text-xs">
        <thead>
          <tr>
            {[
              "No. Nota",
              "Tgl masuk",
              "Pelanggan",
              "Paket",
              "Berat kg",
              "Status bayar",
              "Status cucian",
              "Total",
              "Dibayar",
            ].map((x) => (
              <th key={x} className="border p-2">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.id}>
              <td className="border p-2">{t.invoiceNumber}</td>
              <td className="border p-2">
                {new Date(t.intakeAt).toLocaleDateString("id-ID")}
              </td>
              <td className="border p-2">
                {(t as unknown as { customer?: Customer }).customer?.name ||
                  "—"}
              </td>
              <td className="border p-2">
                {(t as unknown as { package?: LaundryPackage }).package?.name ||
                  "Satuan"}
              </td>
              <td className="border p-2">{t.weightKg ?? "—"}</td>
              <td className="border p-2">{t.paymentStatus}</td>
              <td className="border p-2">{t.processStatus}</td>
              <td className="border p-2">{money(t.totalAmount)}</td>
              <td className="border p-2">{money(t.paidAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
