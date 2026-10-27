import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import {
  Customer,
  LaundryTransaction,
  Payment,
  ProcessHistory,
  LaundryPackage,
  LaundryOrderItem,
} from "@/models";
import UpdateStatusForm from "./UpdateStatusForm";

// Fitur detail transaksi: menampilkan status, pembayaran, form update status/pembayaran dan struk.
const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default async function TransactionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  await initDb();
  const { id } = await params;
  const tx = await LaundryTransaction.findByPk(Number(id), {
    include: [
      { model: Customer, as: "customer" },
      { model: Payment, as: "payments" },
      { model: ProcessHistory, as: "history" },
      { model: LaundryPackage, as: "package" },
      { model: LaundryOrderItem, as: "items" },
    ],
  });
  if (!tx) notFound();
  const customer = (tx as unknown as { customer: Customer }).customer;
  const payments = (tx as unknown as { payments: Payment[] }).payments ?? [];
  const history =
    (tx as unknown as { history: ProcessHistory[] }).history ?? [];
  const pkg = (tx as unknown as { package?: LaundryPackage }).package;
  const items = (tx as unknown as { items?: LaundryOrderItem[] }).items ?? [];
  const stages = [
    ["waiting", "Menunggu antrean"],
    ["washing", "Sedang dicuci"],
    ["drying", "Proses pengeringan"],
    ["ironing", "Proses setrika"],
    ["ready", "Siap diambil"],
    ["picked_up", "Selesai diambil"],
  ];
  const currentStageIndex = stages.findIndex(
    ([key]) => key === tx.processStatus,
  );
  const statusLabel: Record<string, string> = {
    waiting: "Menunggu antrean",
    washing: "Sedang dicuci",
    drying: "Proses pengeringan",
    ironing: "Proses setrika",
    ready: "Siap diambil",
    picked_up: "Selesai diambil",
  };
  const paymentLabel: Record<string, string> = {
    unpaid: "Belum lunas",
    partial: "Sebagian",
    paid: "Lunas",
  };
  return (
    <main className="mx-auto max-w-4xl p-5 lg:p-10">
      <Link href="/transactions" className="text-sm text-cyan-700">
        ← Kembali ke transaksi
      </Link>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Detail transaksi</h1>
          <p className="mt-2 font-mono text-cyan-700">{tx.invoiceNumber}</p>
        </div>
        <Link
          target="_blank"
          href={`/transactions/${tx.id}/receipt`}
          className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"
        >
          Lihat / cetak struk
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 font-bold">Informasi pesanan</h2>
          <p className="mb-2 text-sm text-slate-500">Pelanggan</p>
          <p className="font-semibold">{customer?.name}</p>
          <p className="mt-3 text-sm text-slate-500">Telepon</p>
          <p>{customer?.phone}</p>
          <p className="mt-3 text-sm text-slate-500">Layanan / berat</p>
          <p>
            {pkg?.name ?? "Cucian satuan"}{" "}
            {tx.weightKg ? `· ${tx.weightKg} kg` : ""}
          </p>
          <p className="mt-3 text-sm text-slate-500">Estimasi selesai</p>
          <p>
            {tx.estimatedFinish
              ? new Date(tx.estimatedFinish).toLocaleString("id-ID")
              : "—"}
          </p>
          <p className="mt-3 text-sm text-slate-500">Rincian item satuan</p>
          {items.length ? (
            items.map((item) => (
              <p key={item.id}>
                {item.itemName} × {item.quantity} — {money(item.subtotal)}
              </p>
            ))
          ) : (
            <p>—</p>
          )}
          <p className="mt-3 text-sm text-slate-500">Catatan</p>
          <p>{tx.notes || "—"}</p>
        </article>
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 font-bold">Ringkasan pembayaran</h2>
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold">{money(tx.totalAmount)}</p>
          <p className="mt-3 text-sm text-slate-500">Sudah dibayar</p>
          <p className="font-semibold">{money(tx.paidAmount)}</p>
          <p className="mt-3 text-sm text-slate-500">Sisa</p>
          <p className="font-semibold">
            {money(Number(tx.totalAmount) - Number(tx.paidAmount))}
          </p>
          <p className="mt-3 text-sm text-slate-500">Status</p>
          <p>{paymentLabel[tx.paymentStatus] || tx.paymentStatus}</p>
        </article>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 font-bold">Perbarui status proses</h2>

          <UpdateStatusForm
            transactionId={Number(tx.id)}
            currentStatus={tx.processStatus}
            paymentStatus={tx.paymentStatus}
          />
        </article>
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 font-bold">Catat pembayaran</h2>
          <form
            action={`/api/transactions/${tx.id}/payments`}
            method="post"
            className="space-y-4"
          >
            <label className="block text-sm">
              Jumlah bayar (Rp)
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="amount"
                type="number"
                min="1"
                max={Math.max(
                  0,
                  Number(tx.totalAmount) - Number(tx.paidAmount),
                )}
                required
              />
            </label>
            <label className="block text-sm">
              Metode
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="method"
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </label>
            <button className="bg-emerald-600 text-white inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5">
              Simpan pembayaran
            </button>
          </form>
        </article>
      </section>
      <section className="mt-5 rounded-2xl border bg-white p-6">
        <h2 className="mb-4 font-bold">Riwayat pembayaran</h2>
        {payments.length ? (
          payments.map((p) => (
            <div
              key={p.id}
              className="flex justify-between border-b py-3 text-sm"
            >
              <span>
                {p.method === "cash"
                  ? "Tunai"
                  : p.method === "transfer"
                    ? "Transfer"
                    : "QRIS"}{" "}
                · {new Date(p.createdAt as Date).toLocaleString("id-ID")}
              </span>
              <b>{money(p.amount)}</b>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Belum ada pembayaran.</p>
        )}
      </section>
      <section className="mt-5 rounded-2xl border bg-white p-6">
        <h2 className="mb-4 font-bold">Riwayat status proses</h2>
        {history.length ? (
          [...history]
            .sort(
              (a, b) =>
                new Date(b.createdAt as Date).getTime() -
                new Date(a.createdAt as Date).getTime(),
            )
            .map((h) => (
              <div
                key={h.id}
                className="flex justify-between gap-4 border-b py-3 text-sm"
              >
                <b>{statusLabel[h.status] || h.status}</b>
                <span className="text-slate-500">
                  {new Date(h.createdAt as Date).toLocaleString("id-ID")}
                </span>
              </div>
            ))
        ) : (
          <p className="text-sm text-slate-500">
            Riwayat akan muncul setelah status pertama kali diubah.
          </p>
        )}
      </section>
    </main>
  );
}
