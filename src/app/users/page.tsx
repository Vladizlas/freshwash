
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import UserActions from "./UserAction";

export default async function UsersPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/?forbidden=1");

  await initDb();

  const users = await User.findAll({
    order: [["createdAt", "DESC"]],
  });

  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-10">
      <header className="mb-7">
        <p className="text-sm font-semibold text-cyan-700">
          Administrator / Pemilik Usaha
        </p>
        <h1 className="mt-2 text-3xl font-bold">Manajemen Pegawai</h1>
        <p className="mt-2 text-sm text-slate-500">
          Buat akun pegawai dan tentukan wewenangnya sesuai tugas di laundry.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border bg-white p-5 lg:p-6">
        <h2 className="text-lg font-bold">Tambah akun pegawai</h2>

        <form
          action="/api/users"
          method="post"
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <label className="text-sm font-medium">
            Nama lengkap
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              name="name"
              minLength={2}
              required
            />
          </label>

          <label className="text-sm font-medium">
            Email login
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              name="email"
              type="email"
              required
            />
          </label>

          <label className="text-sm font-medium">
            Password awal (minimal 8 karakter)
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>

          <label className="text-sm font-medium">
            Role
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              name="role"
              defaultValue="cashier"
            >
              <option value="cashier">Front Desk / Operator Kasir</option>
              <option value="admin">Administrator / Pemilik Usaha</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white hover:bg-cyan-700"
            >
              Buat akun
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-bold">Daftar akun</h2>
          <p className="mt-1 text-sm text-slate-500">
            Password tidak ditampilkan dan disimpan dalam bentuk hash.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-medium">
                    {user.name}
                    {user.id === session.id && (
                      <span className="ml-2 text-xs text-cyan-700">
                        Akun Anda
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">{user.email}</td>

                  <td className="px-5 py-4">
                    {user.role === "admin"
                      ? "Administrator / Pemilik"
                      : "Front Desk / Operator Kasir"}
                  </td>

                  <td className="px-5 py-4">
                    <UserActions
                      userId={user.id}
                      userName={user.name}
                      userEmail={user.email}
                      currentRole={user.role as "admin" | "cashier"}
                      isCurrentUser={user.id === session.id}
                    />
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Belum ada akun pegawai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
