import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import {
  Customer,
  LaundryTransaction,
  LaundryPackage,
  LaundryOrderItem,
} from "@/models";

const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const processStatusLabels: Record<string, string> = {
  waiting: "Menunggu antrean",
  washing: "Sedang dicuci",
  drying: "Sedang dikeringkan",
  ironing: "Sedang disetrika",
  ready: "Siap diambil",
  picked_up: "Sudah diambil",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Belum lunas",
  partial: "Dibayar sebagian",
  paid: "Lunas",
};

export default async function ReceiptPage({
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
      { model: LaundryPackage, as: "package" },
      { model: LaundryOrderItem, as: "items" },
    ],
  });

  if (!tx) notFound();

  const customer = (tx as unknown as { customer: Customer }).customer;
  const pkg = (tx as unknown as { package?: LaundryPackage }).package;
  const items =
    (tx as unknown as { items?: LaundryOrderItem[] }).items || [];

  const processStatus = String(tx.processStatus);
  const paymentStatus = String(tx.paymentStatus);

  const processStatusLabel =
    processStatusLabels[processStatus] || processStatus;

  const paymentStatusLabel =
    paymentStatusLabels[paymentStatus] || paymentStatus;

  return (
    <main className="mx-auto max-w-xl p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/transactions/${tx.id}`} className="text-cyan-700">
          ← Detail transaksi
        </Link>

        <p className="text-sm text-slate-500">
          Gunakan Ctrl+P lalu pilih cetak atau Save as PDF.
        </p>
      </div>

      <article className="rounded-2xl border bg-white p-8 print:border-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold">FreshWash Express</h1>
          <p className="text-sm text-slate-500">
            Nota resi pengambilan laundry
          </p>
        </div>

        <hr className="my-5" />

        <div className="space-y-2 text-sm">
          <p>
            <b>No. nota:</b> {tx.invoiceNumber}
          </p>

          <p>
            <b>Tanggal diterima:</b>{" "}
            {new Date(tx.intakeAt).toLocaleString("id-ID")}
          </p>

          <p>
            <b>Estimasi selesai:</b>{" "}
            {tx.estimatedFinish
              ? new Date(tx.estimatedFinish).toLocaleString("id-ID")
              : "—"}
          </p>

          <p>
            <b>Pelanggan:</b> {customer?.name}
          </p>

          <p>
            <b>No. WhatsApp:</b> {customer?.phone}
          </p>

          <p>
            <b>Alamat:</b> {customer?.address || "—"}
          </p>

          <p>
            <b>Paket:</b> {pkg?.name || "Cucian satuan"}
          </p>

          {tx.weightKg && (
            <p>
              <b>Berat:</b> {tx.weightKg} kg
            </p>
          )}

          <p>
            <b>Status cucian:</b> {processStatusLabel}
          </p>

          <p>
            <b>Status pembayaran:</b> {paymentStatusLabel}
          </p>

          <p>
            <b>Catatan khusus:</b> {tx.notes || "—"}
          </p>
        </div>

        <hr className="my-5" />

        <h2 className="mb-3 font-bold">Rincian biaya</h2>

        {tx.weightKg && (
          <div className="flex justify-between text-sm">
            <span>Biaya kiloan</span>
            <span>{money(tx.totalKiloan)}</span>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-3 py-1 text-sm"
          >
            <span>
              {item.itemName} × {item.quantity}
            </span>
            <span>{money(item.subtotal)}</span>
          </div>
        ))}

        <div className="mt-2 flex justify-between text-sm">
          <span>Diskon</span>
          <span>- {money(tx.discount)}</span>
        </div>

        <div className="mt-3 flex justify-between border-t pt-3">
          <span>Grand total</span>
          <b>{money(tx.totalAmount)}</b>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Sudah dibayar</span>
          <b>{money(tx.paidAmount)}</b>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Sisa pembayaran</span>
          <b>
            {money(
              Number(tx.totalAmount) - Number(tx.paidAmount),
            )}
          </b>
        </div>

        <div className="mt-6 flex justify-center">
          <img
            src={`/api/barcode/${encodeURIComponent(tx.invoiceNumber)}`}
            alt="Barcode nomor nota"
            className="h-20 max-w-full object-contain"
          />
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          <b>Syarat dan ketentuan:</b>
          <ul className="ml-4 list-disc">
            <li>Simpan nota ini sebagai bukti pengambilan.</li>
            <li>
              Periksa jumlah dan kondisi pakaian saat diterima kembali.
            </li>
            <li>
              Cucian hanya dapat diserahkan setelah pembayaran lunas.
            </li>
            <li>
              Informasikan catatan khusus pakaian saat menyerahkan cucian.
            </li>
          </ul>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Terima kasih telah menggunakan FreshWash Express.
        </p>
      </article>
    </main>
  );
}