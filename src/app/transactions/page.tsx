import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { Customer, LaundryTransaction } from "@/models";
import Pagination from "@/components/pagination";

// Fitur daftar transaksi: invoice, pelanggan, total, status bayar dan status proses.
const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
const processLabel: Record<string, string> = {
  waiting: "Menunggu antrean",
  washing: "Sedang dicuci",
  drying: "Pengeringan",
  ironing: "Setrika",
  ready: "Siap diambil",
  picked_up: "Selesai diambil",
};
const paymentLabel: Record<string, string> = {
  unpaid: "Belum lunas",
  partial: "Sebagian",
  paid: "Lunas",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await getSession())) redirect("/login");

  await initDb();

  const params = await searchParams;
  const pageSize = 5;
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const totalItems = await LaundryTransaction.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const txs = await LaundryTransaction.findAll({
    include: [{ model: Customer, as: "customer" }],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  // Pertahankan JSX tabel transaksi yang sudah ada.
  return (
    <main className="mx-auto max-w-7xl p-5 lg:p-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-cyan-700">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Transaksi laundry</h1>
        </div>
        <Link
          href="/transactions/new"
          className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white"
        >
          + Transaksi baru
        </Link>
      </div>
      <section className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                "Invoice",
                "Pelanggan",
                "Layanan",
                "Total",
                "Pembayaran",
                "Proses",
                "",
              ].map((x) => (
                <th key={x} className="p-4">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {txs.map((tx) => (
              <tr key={tx.id}>
                <td className="p-4 font-semibold text-cyan-700">
                  {tx.invoiceNumber}
                </td>
                <td className="p-4">
                  {(tx as unknown as { customer?: Customer }).customer?.name ??
                    "—"}
                </td>
                <td className="p-4">{tx.serviceType}</td>
                <td className="p-4">{money(tx.totalAmount)}</td>
                <td className="p-4">
                  {paymentLabel[tx.paymentStatus] || tx.paymentStatus}
                </td>
                <td className="p-4">
                  {processLabel[tx.processStatus] || tx.processStatus}
                </td>
                <td className="p-4">
                  <Link
                    href={`/transactions/${tx.id}`}
                    className="font-semibold text-cyan-700"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!txs.length && (
          <p className="p-8 text-center text-slate-500">Belum ada transaksi.</p>
        )}
      </section>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        basePath="/transactions"
      />
    </main>
  );
}
