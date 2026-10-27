"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CustomerForm() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/customers", {
        method: "POST",
        body: formData,
      });

      const result: { message?: string } = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Gagal menyimpan pelanggan.");
        return;
      }

      setSuccess("Pelanggan berhasil ditambahkan.");

      router.push("/customers");
      router.refresh();
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nama pelanggan
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          placeholder="Masukkan nama pelanggan"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          No Telp
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          minLength={8}
          maxLength={20}
          pattern="[+]?[0-9() .-]+"
          title="Gunakan angka dan awalan + jika diperlukan."
          placeholder="081234567890 atau +6281234567890"
          aria-describedby="phone-hint"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <p id="phone-hint" className="mt-1 text-xs text-gray-500">
          Masukkan 8–15 digit angka. Spasi, tanda hubung, dan awalan +
          diperbolehkan.
        </p>
        {error && (
          <p
            id="phone-error"
            role="alert"
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Alamat
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          maxLength={2000}
          autoComplete="street-address"
          placeholder="Masukkan alamat pelanggan (opsional)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan pelanggan"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/customers")}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
