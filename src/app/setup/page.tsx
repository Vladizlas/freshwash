import { redirect } from "next/navigation";
import { initDb } from "@/lib/db";
import { User } from "@/models";

// Fitur setup admin pertama: halaman ini ditutup otomatis setelah ada akun.
export default async function SetupPage() {
  await initDb();
  if (await User.count()) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Buat admin pertama</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hanya tersedia sebelum akun pertama dibuat.
        </p>
        <form action="/api/auth/setup" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Nama
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="name"
              required
              minLength={2}
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="email"
              type="email"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password (minimal 8 karakter)
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>
          <button className="w-full bg-cyan-600 text-white inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5">
            Buat akun admin
          </button>
        </form>
      </section>
    </main>
  );
}
