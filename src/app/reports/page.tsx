
import Link from "next/link";
import { redirect } from "next/navigation";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import Pagination from "@/components/pagination";
import {
  Customer,
  LaundryPackage,
  LaundryTransaction,
  LaundryOrderItem,
} from "@/models";

const PAGE_SIZE = 5;

const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const paymentLabel: Record<string, string> = {
  paid: "Lunas",
  partial: "Sebagian",
  unpaid: "Piutang / belum lunas",
};

const processLabel: Record<string, string> = {
  waiting: "Menunggu antrean",
  washing: "Sedang dicuci",
  drying: "Pengeringan",
  ironing: "Setrika",
  ready: "Siap diambil",
  picked_up: "Selesai diambil",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    packageId?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/?forbidden=1");

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

  if (q.packageId) {
    where.packageId = Number(q.packageId);
  }

  if (
    q.paymentStatus &&
    ["paid", "partial", "unpaid"].includes(q.paymentStatus)
  ) {
    where.paymentStatus = q.paymentStatus;
  }

  const [allTransactions, packages] = await Promise.all([
    LaundryTransaction.findAll({
      where,
      include: [
        { model: Customer, as: "customer" },
        { model: LaundryPackage, as: "package" },
        { model: LaundryOrderItem, as: "items" },
      ],
      order: [["createdAt", "DESC"]],
    }),
    LaundryPackage.findAll({
      order: [["name", "ASC"]],
    }),
  ]);

  const totalItems = allTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const requestedPage = Math.max(1, Number(q.page) || 1);
  const page = Math.min(requestedPage, totalPages);

  const reportRows = allTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalWeight = allTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.weightKg || 0),
    0,
  );

  const kiloRevenue = allTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.totalKiloan || 0),
    0,
  );

  const unitRevenue = allTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.totalUnit || 0),
    0,
  );

  const debts = allTransactions.filter(
    (transaction) => transaction.paymentStatus !== "paid",
  ).length;

  const preservedQuery: Record<string, string> = {
    from,
    to,
  };

  if (q.packageId) preservedQuery.packageId = q.packageId;
  if (q.paymentStatus) preservedQuery.paymentStatus = q.paymentStatus;

  const exportQuery = new URLSearchParams(preservedQuery).toString();

  return (
    <main className="mx-auto max-w-7xl p-5 lg:p-10">
      <Link href="/" className="text-sm text-cyan-700">
        ← Dashboard
      </Link>

      <header className="my-5">
        <p className="text-sm font-semibold text-cyan-700">
          Administrator / Pemilik Usaha
        </p>
        <h1 className="mt-1 text-3xl font-bold">
          Laporan & analisis
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Rekap historis transaksi, pendapatan, dan piutang sesuai filter.
        </p>
      </header>

      <form
        className="mb-5 grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-2 xl:grid-cols-5"
        action="/reports"
        method="get"
      >
        <label className="text-sm">
          Dari tanggal
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="from"
            type="date"
            defaultValue={from}
          />
        </label>

        <label className="text-sm">
          Sampai tanggal
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="to"
            type="date"
            defaultValue={to}
          />
        </label>

        <label className="text-sm">
          Paket layanan
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="packageId"
            defaultValue={q.packageId || ""}
          >
            <option value="">Semua paket</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Status pembayaran
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="paymentStatus"
            defaultValue={q.paymentStatus || ""}
          >
            <option value="">Semua status</option>
            <option value="paid">Lunas</option>
            <option value="partial">Sebagian</option>
            <option value="unpaid">Piutang / belum lunas</option>
          </select>
        </label>

        <div className="flex flex-wrap items-end gap-2">
          <button className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-cyan-700">
            Terapkan
          </button>

          <Link
            className="rounded-xl border px-3 py-2.5 text-sm font-semibold"
            href={`/api/reports/csv?${exportQuery}`}
          >
            CSV
          </Link>

          <Link
            className="rounded-xl border px-3 py-2.5 text-sm font-semibold"
            href={`/api/reports/xlsx?${exportQuery}`}
          >
            Excel
          </Link>

          <Link
            className="rounded-xl border px-3 py-2.5 text-sm font-semibold"
            href={`/reports/print?${exportQuery}`}
          >
            Cetak / PDF
          </Link>
        </div>
      </form>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Jumlah nota", String(totalItems)],
          [
            "Total berat cucian",
            `${totalWeight.toLocaleString("id-ID")} kg`,
          ],
          ["Pendapatan kiloan", money(kiloRevenue)],
          ["Pendapatan satuan", money(unitRevenue)],
          ["Nota belum lunas", String(debts)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-2xl border bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-xl font-bold">{value}</p>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-bold">Rincian laporan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kolom disusun mengikuti lembar spesifikasi proyek.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "No. nota",
                  "Tgl masuk",
                  "Pelanggan",
                  "Paket",
                  "Berat / item",
                  "Estimasi jadi",
                  "Grand total",
                  "Status bayar",
                  "Status cucian",
                ].map((heading) => (
                  <th key={heading} className="p-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {reportRows.map((transaction) => {
                const items =
                  (
                    transaction as unknown as {
                      items?: LaundryOrderItem[];
                    }
                  ).items || [];

                const customer = (
                  transaction as unknown as {
                    customer?: Customer;
                  }
                ).customer;

                const pkg = (
                  transaction as unknown as {
                    package?: LaundryPackage;
                  }
                ).package;

                return (
                  <tr key={transaction.id}>
                    <td className="p-3">
                      <Link
                        className="font-semibold text-cyan-700 hover:underline"
                        href={`/transactions/${transaction.id}`}
                      >
                        {transaction.invoiceNumber}
                      </Link>
                    </td>

                    <td className="p-3">
                      {new Date(transaction.intakeAt).toLocaleDateString(
                        "id-ID",
                      )}
                    </td>

                    <td className="p-3">{customer?.name || "—"}</td>
                    <td className="p-3">{pkg?.name || "Cucian satuan"}</td>

                    <td className="p-3">
                      {transaction.weightKg
                        ? `${transaction.weightKg} kg`
                        : items
                            .map(
                              (item) =>
                                `${item.itemName} ×${item.quantity}`,
                            )
                            .join(", ") || "—"}
                    </td>

                    <td className="p-3">
                      {transaction.estimatedFinish
                        ? new Date(
                            transaction.estimatedFinish,
                          ).toLocaleString("id-ID")
                        : "—"}
                    </td>

                    <td className="p-3 font-semibold">
                      {money(transaction.totalAmount)}
                    </td>

                    <td className="p-3">
                      {paymentLabel[transaction.paymentStatus] ||
                        transaction.paymentStatus}
                    </td>

                    <td className="p-3">
                      {processLabel[transaction.processStatus] ||
                        transaction.processStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalItems === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              Tidak ada transaksi untuk filter ini.
            </p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          basePath="/reports"
          query={preservedQuery}
        />
      </section>
    </main>
  );
}
