import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { Customer } from "@/models";

// Fitur edit pelanggan: form diisi dari data yang sudah tersimpan.
export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  await initDb();
  const { id } = await params;
  const c = await Customer.findByPk(Number(id));
  if (!c) notFound();
  return (
    <main className="mx-auto max-w-2xl p-5 lg:p-10">
      <Link href="/customers" className="text-sm text-cyan-700">
        ← Kembali ke pelanggan
      </Link>
      <h1 className="my-5 text-3xl font-bold">Edit pelanggan</h1>
      <form
        action={`/api/customers/${c.id}`}
        method="post"
        className="space-y-4 rounded-2xl border bg-white p-6"
      >
        <label className="block text-sm font-medium">
          Nama
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="name"
            defaultValue={c.name}
            required
            minLength={2}
          />
        </label>
        <label className="block text-sm font-medium">
          Telepon
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="phone"
            defaultValue={c.phone}
            required
            minLength={8}
          />
        </label>
        <label className="block text-sm font-medium">
          Alamat
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            name="address"
            defaultValue={c.address ?? ""}
            rows={3}
          />
        </label>
        <button className="bg-cyan-600 text-white inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5">
          Simpan perubahan
        </button>
      </form>
    </main>
  );
}
