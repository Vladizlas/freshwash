
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { Customer } from "@/models";
import Pagination from "@/components/pagination";

// Jumlah pelanggan yang ditampilkan per halaman.
const PAGE_SIZE = 5;

// Halaman daftar pelanggan: melihat, menambah, mengedit, dan menghapus data.
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  if (!(await getSession())) {
    redirect("/login");
  }

  await initDb();

  const params = await searchParams;

  // Hitung total pelanggan untuk menentukan jumlah halaman.
  const totalItems = await Customer.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Pastikan nomor halaman valid.
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const page = Math.min(requestedPage, totalPages);

  // Ambil hanya data yang diperlukan untuk halaman saat ini.
  const customers = await Customer.findAll({
    order: [["name", "ASC"]],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-cyan-700">
            ← Dashboard
          </Link>

          <h1 className="mt-2 text-3xl font-bold">Pelanggan</h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola data pelanggan FreshWash.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700"
        >
          + Pelanggan
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Telepon</th>
                <th className="p-4">Alamat</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="p-4 font-semibold text-slate-800">
                    {customer.name}
                  </td>

                  <td className="p-4 text-slate-600">
                    {customer.phone}
                  </td>

                  <td className="p-4 text-slate-600">
                    {customer.address || "—"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        className="font-medium text-cyan-700 hover:underline"
                        href={`/customers/${customer.id}/edit`}
                      >
                        Edit
                      </Link>

                      <form
                        action={`/api/customers/${customer.id}/delete`}
                        method="post"
                        onSubmit={undefined}
                      >
                        <button
                          type="submit"
                          className="font-medium text-rose-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalItems === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Belum ada pelanggan.
          </p>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          basePath="/customers"
        />
      </section>
    </main>
  );
}
