import Link from "next/link";
import { redirect } from "next/navigation";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { Customer, LaundryTransaction, Payment } from "@/models";
const money = (value: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const processLabel: Record<string, string> = {
  waiting: "Menunggu antrean",
  washing: "Sedang dicuci",
  drying: "Pengeringan",
  ironing: "Setrika",
  ready: "Siap diambil",
  picked_up: "Selesai diambil",
};
export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  await initDb();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [todayRows, activeCount, readyCount, monthlyIncome, recent] =
    await Promise.all([
      LaundryTransaction.findAll({
        where: { intakeAt: { [Op.gte]: today, [Op.lt]: tomorrow } },
      }),
      LaundryTransaction.count({
        where: {
          processStatus: {
            [Op.in]: ["waiting", "washing", "drying", "ironing"],
          },
        },
      }),
      LaundryTransaction.count({ where: { processStatus: "ready" } }),
      Payment.sum("amount", { where: { createdAt: { [Op.gte]: monthStart } } }),
      LaundryTransaction.findAll({
        include: [{ model: Customer, as: "customer" }],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);
  const weightToday = todayRows.reduce(
    (s, t) => s + Number(t.weightKg || 0),
    0,
  );
  const itemCountToday = todayRows.reduce((s, t) => s + 1, 0);
  const summaryCards = [
    [
      "Cucian masuk hari ini",
      `${weightToday.toLocaleString("id-ID")} kg · ${itemCountToday} nota`,
    ],
    ["Sedang diproses", String(activeCount)],
    ["Siap diambil", String(readyCount)],
    ["Omzet kasir bulan ini", money(monthlyIncome || 0)],
  ];
  const chartDays = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = await LaundryTransaction.count({
        where: {
          intakeAt: {
            [Op.gte]: day,
            [Op.lt]: next,
          },
        },
      });
      return {
        label: day.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        count,
      };
    }),
  );
  const maxCount = Math.max(1, ...chartDays.map((d) => d.count));
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl p-5 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              FreshWash Express
            </p>
            <h1 className="mt-1 text-3xl font-bold">Dashboard operasional</h1>
            <p className="mt-2 text-sm text-slate-500">
              Ringkasan penerimaan cucian dan progres pengerjaan.
            </p>
          </div>
          <Link
            href="/transactions/new"
            className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white"
          >
            + Transaksi baru
          </Link>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(([label, value]) => (
            <article key={label} className="rounded-2xl border bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-4 text-2xl font-bold">{value}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border bg-white p-5">
            <div className="mb-5">
              <h2 className="font-bold">Tren transaksi 7 hari terakhir</h2>
              <p className="text-sm text-slate-500">Jumlah nota per hari</p>
            </div>
            <div className="flex h-48 items-end gap-3">
              {chartDays.map((d) => (
                <div
                  key={d.label}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold">{d.count}</span>
                  <div
                    className="w-full max-w-12 rounded-t-lg bg-cyan-500"
                    style={{
                      height: `${Math.max(4, (d.count / maxCount) * 130)}px`,
                    }}
                  />
                  <span className="text-center text-[11px] text-slate-500">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="font-bold">Alur status pengerjaan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Perbarui secara berurutan dari detail nota.
            </p>
            <ol className="mt-5 space-y-3">
              {[
                ["Menunggu antrean", "waiting"],
                ["Sedang dicuci", "washing"],
                ["Proses pengeringan", "drying"],
                ["Proses setrika", "ironing"],
                ["Siap diambil", "ready"],
                ["Selesai diambil", "picked_up"],
              ].map(([label, key], i) => (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">
                    {i + 1}
                  </span>
                  <span className="text-sm">{label}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <section className="mt-6 overflow-hidden rounded-2xl border bg-white">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-bold">Transaksi terbaru</h2>
              <p className="text-sm text-slate-500">
                Lima nota terakhir beserta status
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-cyan-700"
              href="/transactions"
            >
              Lihat semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "No. nota",
                    "Pelanggan",
                    "Layanan",
                    "Status cucian",
                    "Total",
                  ].map((h) => (
                    <th key={h} className="px-5 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold text-cyan-700"
                        href={`/transactions/${t.id}`}
                      >
                        {t.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {(t as unknown as { customer?: Customer }).customer
                        ?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4">{t.serviceType}</td>
                    <td className="px-5 py-4">
                      {processLabel[t.processStatus] || t.processStatus}
                    </td>
                    <td className="px-5 py-4">{money(t.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                Belum ada transaksi. Gunakan tombol Transaksi baru untuk mulai.
              </p>
            )}
          </div>
        </section>
        {session.role === "admin" && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            >
              Kelola paket & tarif
            </Link>
            <Link
              href="/users"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            >
              Kelola pegawai
            </Link>
            <Link
              href="/reports"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            >
              Buka laporan
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
