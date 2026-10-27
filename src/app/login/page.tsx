import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Fitur halaman login: form mengirim email/password ke API login.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 inline-flex rounded-xl bg-cyan-600 p-3 font-bold text-white">
            F
          </div>
          <h1 className="text-2xl font-bold">Masuk ke FreshWash</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gunakan akun admin atau kasir.
          </p>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            Email atau password salah, atau server belum dikonfigurasi.
          </p>
        )}
        <form action="/api/auth/login" method="post" className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              type="email"
              name="email"
              required
              autoComplete="username"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="w-full bg-cyan-600 text-white inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2.5">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
