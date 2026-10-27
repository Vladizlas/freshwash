
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { User } from "@/models";
import { requireUser } from "@/lib/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type EditableRole = "admin" | "cashier";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function getTargetUser(id: string) {
  if (!/^[1-9]\d*$/.test(id)) return null;

  const userId = Number(id);
  if (!Number.isSafeInteger(userId)) return null;

  return User.findByPk(userId);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const auth = await requireUser();

  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin") {
    return jsonError("Akses khusus Administrator/Pemilik.", 403);
  }

  try {
    await initDb();

    const { id } = await params;
    const target = await getTargetUser(id);

    if (!target) {
      return jsonError("Akun tidak ditemukan.", 404);
    }

    const body: unknown = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Data akun tidak valid.", 400);
    }

    const data = body as Record<string, unknown>;
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const email =
      typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const role = data.role;
    const password = data.password;

    if (name.length < 2 || name.length > 120) {
      return jsonError("Nama harus terdiri dari 2–120 karakter.", 400);
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonError("Format email tidak valid.", 400);
    }

    if (role !== "admin" && role !== "cashier") {
      return jsonError("Role tidak valid.", 400);
    }

    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return jsonError("Password baru minimal 8 karakter.", 400);
      }
      if (password.length > 128) {
        return jsonError("Password terlalu panjang.", 400);
      }
    }

    if (target.id === auth.user!.id && role !== "admin") {
      return jsonError(
        "Role akun yang sedang digunakan tidak dapat diturunkan.",
        409,
      );
    }

    const existing = await User.findOne({ where: { email } });

    if (existing && existing.id !== target.id) {
      return jsonError("Email sudah digunakan oleh akun lain.", 409);
    }

    if (target.role === "admin" && role === "cashier") {
      const adminCount = await User.count({ where: { role: "admin" } });

      if (adminCount <= 1) {
        return jsonError(
          "Role admin terakhir tidak dapat diturunkan. Buat admin lain terlebih dahulu.",
          409,
        );
      }
    }

    const updates: {
      name: string;
      email: string;
      role: EditableRole;
      passwordHash?: string;
    } = { name, email, role };

    if (typeof password === "string" && password.length > 0) {
      updates.passwordHash = await bcrypt.hash(password, 12);
    }

    await target.update(updates);

    return NextResponse.json({ message: "Akun berhasil diperbarui." });
  } catch (error) {
    console.error("Gagal mengubah akun:", error);
    return jsonError("Terjadi kesalahan saat mengubah akun.", 500);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const auth = await requireUser();

  if (auth.response) return auth.response;
  if (auth.user!.role !== "admin") {
    return jsonError("Akses khusus Administrator/Pemilik.", 403);
  }

  try {
    await initDb();

    const { id } = await params;
    const target = await getTargetUser(id);

    if (!target) {
      return jsonError("Akun tidak ditemukan.", 404);
    }

    if (target.id === auth.user!.id) {
      return jsonError("Anda tidak dapat menghapus akun sendiri.", 409);
    }

    if (target.role === "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });

      if (adminCount <= 1) {
        return jsonError(
          "Admin terakhir tidak dapat dihapus. Buat admin lain terlebih dahulu.",
          409,
        );
      }
    }

    await target.destroy();

    return NextResponse.json({ message: "Akun berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus akun:", error);
    return jsonError(
      "Gagal menghapus akun. Periksa apakah akun masih terkait dengan data lain.",
      500,
    );
  }
}
