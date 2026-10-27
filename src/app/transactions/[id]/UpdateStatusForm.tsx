"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const stages = [
  { value: "waiting", label: "Menunggu antrean" },
  { value: "washing", label: "Sedang dicuci" },
  { value: "drying", label: "Proses pengeringan" },
  { value: "ironing", label: "Proses setrika" },
  { value: "ready", label: "Siap diambil" },
  { value: "picked_up", label: "Sudah diambil" },
] as const;

type UpdateStatusFormProps = {
  transactionId: number;
  currentStatus: string;
  paymentStatus: string;
};

type ApiResponse = {
  message?: string;
};

export default function UpdateStatusForm({
  transactionId,
  currentStatus,
  paymentStatus,
}: UpdateStatusFormProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = stages.findIndex(
    (stage) => stage.value === currentStatus,
  );

  const nextStage = stages[currentIndex + 1];
  const isFinished = currentStatus === "picked_up";
  const isBlocked =
    currentStatus === "ready" && paymentStatus !== "paid";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!selectedStatus) {
      setIsError(true);
      setMessage("Pilih status proses terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("processStatus", selectedStatus);

      const response = await fetch(
        `/api/transactions/${transactionId}/status`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setIsError(true);
        setMessage(
          result.message || "Status gagal diperbarui. Silakan coba lagi.",
        );
        return;
      }

      setIsError(false);
      setMessage(result.message || "Status berhasil diperbarui.");
      setSelectedStatus("");

      router.refresh();
    } catch {
      setIsError(true);
      setMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Status proses berikutnya
        <select
          name="processStatus"
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(event.target.value);
            setMessage("");
          }}
          disabled={isFinished || isBlocked || isSubmitting}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
        >
          <option value="">Pilih status berikutnya</option>
          {stages.map((stage, index) => (
            <option
              key={stage.value}
              value={stage.value}
              disabled={
                index !== currentIndex + 1 ||
                (stage.value === "picked_up" && paymentStatus !== "paid")
              }
            >
              {stage.label}
            </option>
          ))}
        </select>
      </label>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-lg border px-3 py-2.5 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </div>
      )}

      {isBlocked && (
        <p className="text-sm text-amber-700">
          Pembayaran harus lunas sebelum cucian dapat ditandai sudah diambil.
        </p>
      )}

      {isFinished && (
        <p className="text-sm text-slate-500">
          Transaksi ini sudah selesai diambil.
        </p>
      )}

      <button
        type="submit"
        disabled={isFinished || isBlocked || isSubmitting}
        className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan status"}
      </button>

      <p className="text-xs text-slate-500">
        Status harus diperbarui secara berurutan. Cucian hanya dapat ditandai
        sudah diambil jika pembayaran sudah lunas.
      </p>
    </form>
  );
}