
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await initDb();

  const user = await User.findByPk(session.id, {
    attributes: ["id", "name", "email", "role"],
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-5 lg:p-10">
      <header className="mb-7">
        <p className="text-sm font-semibold text-cyan-700">
          Pengaturan Akun
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Profil Saya
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Perbarui informasi akun dan password milik Anda.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-xl font-bold text-cyan-800">
            {user.name.trim().charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {user.role === "admin"
                ? "Administrator / Pemilik"
                : "Front Desk / Operator Kasir"}
            </span>
          </div>
        </div>

        <ProfileForm
          initialName={user.name}
          initialEmail={user.email}
        />
      </section>
    </main>
  );
}
