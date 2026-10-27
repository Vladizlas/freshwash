
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import { requireUser } from "@/lib/http";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function PATCH(req: Request) {
  const auth = await requireUser();

  if (auth.response) return auth.response;

  try {
    await initDb();

    const user = await User.findByPk(auth.user!.id);

    if (!user) {
      return errorResponse("Akun tidak ditemukan. Silakan login kembali.", 404);
    }

    const body: unknown = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Data profil tidak valid.", 400);
    }

    const data = body as Record<string, unknown>;

    if (
      typeof data.name !== "string" ||
      typeof data.email !== "string"
    ) {
      return errorResponse("Nama dan email wajib diisi.", 400);
    }

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 120) {
      return errorResponse("Nama harus terdiri dari 2–120 karakter.", 400);
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return errorResponse("Format email tidak valid.", 400);
    }

    const currentPassword = data.currentPassword;
    const newPassword = data.newPassword;

    if (
      currentPassword !== undefined &&
      typeof currentPassword !== "string"
    ) {
      return errorResponse("Password saat ini tidak valid.", 400);
    }

    if (
      newPassword !== undefined &&
      typeof newPassword !== "string"
    ) {
      return errorResponse("Password baru tidak valid.", 400);
    }

    const changingPassword =
      typeof newPassword === "string" && newPassword.length > 0;

    if (changingPassword) {
      if (newPassword.length < 8 || newPassword.length > 128) {
        return errorResponse(
          "Password baru harus terdiri dari 8–128 karakter.",
          400,
        );
      }

      if (
        typeof currentPassword !== "string" ||
        currentPassword.length === 0
      ) {
        return errorResponse(
          "Masukkan password saat ini untuk mengganti password.",
          400,
        );
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );

      if (!passwordMatches) {
        return errorResponse("Password saat ini salah.", 400);
      }
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.id !== user.id) {
      return errorResponse("Email sudah digunakan akun lain.", 409);
    }

    const updates: {
      name: string;
      email: string;
      passwordHash?: string;
    } = { name, email };

    if (changingPassword) {
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.update(updates);

    return NextResponse.json({
      message: "Profil berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);

    return errorResponse("Terjadi kesalahan saat memperbarui profil.", 500);
  }
}
