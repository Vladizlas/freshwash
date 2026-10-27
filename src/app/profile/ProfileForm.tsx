
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialName: string;
  initialEmail: string;
};

type ApiResult = {
  message?: string;
};

export default function ProfileForm({
  initialName,
  initialEmail,
}: ProfileFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Masukkan password saat ini untuk mengganti password.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword,
        }),
      });

      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        setError(result.message ?? "Gagal memperbarui profil.");
        return;
      }

      setSuccess(result.message ?? "Profil berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">
          Nama lengkap
        </label>
        <input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={120}
          autoComplete="name"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div>
        <label htmlFor="profile-email" className="mb-1 block text-sm font-medium">
          Email login
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={254}
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="font-semibold text-slate-900">Ganti password</h3>
        <p className="mt-1 text-sm text-slate-500">
          Kosongkan bagian password jika tidak ingin menggantinya.
        </p>
      </div>

      <div>
        <label
          htmlFor="current-password"
          className="mb-1 block text-sm font-medium"
        >
          Password saat ini
        </label>
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div>
        <label
          htmlFor="new-password"
          className="mb-1 block text-sm font-medium"
        >
          Password baru
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
        <p className="mt-1 text-xs text-slate-500">
          Minimal 8 karakter.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1 block text-sm font-medium"
        >
          Konfirmasi password baru
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Menyimpan..." : "Simpan perubahan"}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => {
            setName(initialName);
            setEmail(initialEmail);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError("");
            setSuccess("");
          }}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
