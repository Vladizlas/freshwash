
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "cashier";

type UserActionsProps = {
  userId: number;
  userName: string;
  userEmail: string;
  currentRole: UserRole;
  isCurrentUser: boolean;
};

export default function UserActions({
  userId,
  userName,
  userEmail,
  currentRole,
  isCurrentUser,
}: UserActionsProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [role, setRole] = useState<UserRole>(currentRole);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function openEditModal() {
    setName(userName);
    setEmail(userEmail);
    setRole(currentRole);
    setPassword("");
    setError("");
    setIsEditing(true);
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          password: password || undefined,
        }),
      });

      const result: { message?: string } = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Gagal mengubah akun.");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun "${userName}" (${userEmail})? Tindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const result: { message?: string } = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Gagal menghapus akun.");
        return;
      }

      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openEditModal}
          className="rounded-lg border border-cyan-600 px-3 py-1.5 font-medium text-cyan-700 hover:bg-cyan-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isCurrentUser}
          title={
            isCurrentUser
              ? "Akun yang sedang digunakan tidak dapat dihapus."
              : "Hapus akun"
          }
          className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDeleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>

      {error && !isEditing && (
        <p role="alert" className="mt-2 max-w-xs text-xs text-red-600">
          {error}
        </p>
      )}

      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setIsEditing(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-user-title-${userId}`}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id={`edit-user-title-${userId}`}
              className="text-xl font-bold text-slate-900"
            >
              Edit akun pegawai
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Perbarui nama, email, role, atau password akun.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleEdit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor={`name-${userId}`}
                  className="mb-1 block text-sm font-medium"
                >
                  Nama lengkap
                </label>
                <input
                  id={`name-${userId}`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor={`email-${userId}`}
                  className="mb-1 block text-sm font-medium"
                >
                  Email login
                </label>
                <input
                  id={`email-${userId}`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor={`role-${userId}`}
                  className="mb-1 block text-sm font-medium"
                >
                  Role
                </label>
                <select
                  id={`role-${userId}`}
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as UserRole)
                  }
                  disabled={isCurrentUser}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                >
                  <option value="cashier">
                    Front Desk / Operator Kasir
                  </option>
                  <option value="admin">
                    Administrator / Pemilik Usaha
                  </option>
                </select>

                {isCurrentUser && (
                  <p className="mt-1 text-xs text-amber-700">
                    Role akun yang sedang digunakan tidak dapat diubah dari
                    form ini.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`password-${userId}`}
                  className="mb-1 block text-sm font-medium"
                >
                  Password baru (opsional)
                </label>
                <input
                  id={`password-${userId}`}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Jika diisi, password harus minimal 8 karakter.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
