
import Link from "next/link";
import CustomerForm from "./CustomerForm"

export default function NewCustomerPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/customers"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke pelanggan
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Tambah pelanggan
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Masukkan data pelanggan baru.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CustomerForm />
      </section>
    </main>
  );
}
