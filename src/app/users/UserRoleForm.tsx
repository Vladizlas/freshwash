"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "cashier";

type UserRoleFormProps = {
  userId: number;
  userName: string;
  currentRole: UserRole;
};

export default function UserRoleForm({
  userId,
  userName,
  currentRole,
}: UserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const formData = new FormData();
      formData.set("role", role);

      const response = await fetch(`/api/users/${userId}/role`, {
        method: "POST",
        body: formData,
      });

      const result: { message?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setIsError(true);
        setMessage(result.message ?? "Gagal mengubah role.");
        return;
      }

      setMessage(result.message ?? "Role berhasil diubah.");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-w-64">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <select
          className="max-w-64 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          aria-label={`Role ${userName}`}
          disabled={isSubmitting}
        >
          <option value="cashier">
            Front Desk / Operator Kasir
          </option>
          <option value="admin">
            Administrator / Pemilik Usaha
          </option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting || role === currentRole}
          className="whitespace-nowrap inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 text-xs ${
            isError ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
