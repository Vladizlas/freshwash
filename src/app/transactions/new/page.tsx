import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { Customer, LaundryPackage, UnitItem } from "@/models";

const money = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default async function NewTransactionPage() {
  if (!(await getSession())) redirect("/login");
  await initDb();
  const [customers, packages, items] = await Promise.all([
    Customer.findAll({ order: [["name", "ASC"]] }),
    LaundryPackage.findAll({
      where: { active: true },
      order: [["name", "ASC"]],
    }),
    UnitItem.findAll({ where: { active: true }, order: [["name", "ASC"]] }),
  ]);
  return (
    <main className="mx-auto max-w-4xl p-5 lg:p-10">
      <Link href="/transactions" className="text-sm text-cyan-700">
        ← Kembali ke transaksi
      </Link>
      <h1 className="my-5 text-3xl font-bold">Penerimaan cucian baru</h1>
      {!customers.length ? (
        <section className="rounded-2xl border bg-white p-6">
          Tambahkan pelanggan terlebih dahulu.{" "}
          <Link href="/customers/new" className="text-cyan-700 underline">
            Tambah pelanggan
          </Link>
        </section>
      ) : (
        <form
          action="/api/transactions"
          method="post"
          className="space-y-6 rounded-2xl border bg-white p-5 lg:p-7"
        >
          <section>
            <h2 className="mb-4 text-lg font-bold">1. Identitas pelanggan</h2>
            <label className="block text-sm font-medium">
              Pelanggan
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="customerId"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih pelanggan
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </option>
                ))}
              </select>
            </label>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">2. Layanan kiloan</h2>
            <label className="block text-sm font-medium">
              Paket dan kecepatan
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="packageId"
                defaultValue=""
              >
                <option value="">
                  Tanpa paket kiloan (cucian satuan saja)
                </option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {money(p.pricePerKg)}/kg · {p.estimatedHours} jam
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Berat minimal kiloan 3 kg. Harga dihitung otomatis berdasarkan
              tarif paket.
            </p>
            <label className="mt-3 block text-sm font-medium">
              Berat timbangan (kg)
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="weightKg"
                type="number"
                min="3"
                max="500"
                step="0.1"
                placeholder="Contoh: 4.5"
              />
            </label>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">
              3. Cucian satuan (opsional)
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Pilih item pada baris yang digunakan. Kosongkan baris yang tidak
              diperlukan.
            </p>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <label className="text-sm">
                    Item satuan
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      name="itemId"
                      defaultValue=""
                    >
                      <option value="">Tidak dipilih</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {money(item.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Kuantitas
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      name="quantity"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="1"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">4. Estimasi dan catatan</h2>
            <label className="block text-sm font-medium">
              Diskon member (Rp)
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="discount"
                type="number"
                min="0"
                step="1000"
                defaultValue="0"
              />
            </label>
            <label className="mt-3 block text-sm font-medium">
              Catatan khusus pakaian
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="notes"
                rows={3}
                placeholder="Contoh: noda luntur, pakaian robek bawaan, parfum Lavender"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Tanggal masuk dibuat otomatis. Estimasi selesai dihitung dari
              durasi paket.
            </p>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">5. Pembayaran awal</h2>
            <label className="block text-sm font-medium">
              Pilihan pembayaran
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="paymentChoice"
                defaultValue="unpaid"
              >
                <option value="unpaid">
                  Bayar nanti saat pengambilan (belum lunas)
                </option>
                <option value="paid">Bayar sekarang (lunas)</option>
              </select>
            </label>
            <label className="mt-3 block text-sm font-medium">
              Metode pembayaran
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="method"
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Total dihitung dan divalidasi di server dari tarif master, item
              satuan, dan diskon.
            </p>
          </section>
          <div className="flex flex-wrap gap-3">
            <button className="bg-cyan-600 text-white inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5">
              Simpan transaksi & buat nota
            </button>
            <Link
              href="/transactions"
              className="rounded-xl border px-4 py-3 text-sm font-semibold"
            >
              Batal
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
