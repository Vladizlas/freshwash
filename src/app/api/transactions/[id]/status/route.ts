import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import {
  LaundryTransaction,
  ProcessHistory,
  sequelize,
} from "@/models";
import type { ProcessStatus } from "@/models";
import { requireUser } from "@/lib/http";

const allowedStatuses = [
  "waiting",
  "washing",
  "drying",
  "ironing",
  "ready",
  "picked_up",
] as const satisfies readonly ProcessStatus[];

function isProcessStatus(value: string): value is ProcessStatus {
  return allowedStatuses.some((status) => status === value);
}

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();

  if (auth.response) return auth.response;

  try {
    await initDb();

    const { id } = await params;
    const transactionId = Number(id);

    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
      return NextResponse.json(
        { message: "ID transaksi tidak valid." },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const rawStatus = form.get("processStatus");
    const status = typeof rawStatus === "string" ? rawStatus : "";

    if (!isProcessStatus(status)) {
      return NextResponse.json(
        { message: "Status tidak valid." },
        { status: 400 },
      );
    }

    const dbTx = await sequelize.transaction();

    try {
      const tx = await LaundryTransaction.findByPk(transactionId, {
        transaction: dbTx,
        lock: dbTx.LOCK.UPDATE,
      });

      if (!tx) {
        await dbTx.rollback();

        return NextResponse.json(
          { message: "Transaksi tidak ditemukan." },
          { status: 404 },
        );
      }

      const currentIndex = allowedStatuses.indexOf(tx.processStatus);
      const nextIndex = allowedStatuses.indexOf(status);

      if (nextIndex <= currentIndex) {
        await dbTx.rollback();

        return NextResponse.json(
          {
            message:
              "Pilih status berikutnya. Status tidak boleh mundur atau diulang.",
          },
          { status: 409 },
        );
      }

      if (nextIndex !== currentIndex + 1) {
        await dbTx.rollback();

        return NextResponse.json(
          { message: "Status harus diperbarui secara berurutan." },
          { status: 409 },
        );
      }

      if (status === "picked_up" && tx.paymentStatus !== "paid") {
        await dbTx.rollback();

        return NextResponse.json(
          {
            message:
              "Pelunasan wajib dilakukan sebelum cucian dapat diambil.",
          },
          { status: 409 },
        );
      }

      await tx.update(
        {
          processStatus: status,
          ...(status === "picked_up"
            ? { pickedUpAt: new Date() }
            : {}),
        },
        { transaction: dbTx },
      );

      await ProcessHistory.create(
        {
          transactionId: tx.id,
          status,
          changedBy: auth.user!.id,
          note: null,
        },
        { transaction: dbTx },
      );

      await dbTx.commit();

      return NextResponse.json({
        message: "Status cucian berhasil diperbarui.",
      });
    } catch (error) {
      try {
        await dbTx.rollback();
      } catch (rollbackError) {
        console.error("Rollback transaksi gagal:", rollbackError);
      }

      throw error;
    }
  } catch (error) {
    console.error("Gagal mengubah status transaksi:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah status. Silakan coba lagi." },
      { status: 500 },
    );
  }
}