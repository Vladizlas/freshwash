
import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { Customer } from "@/models";
import { customerSchema } from "@/lib/validators";
import { requireUser } from "@/lib/http";

export const runtime = "nodejs";

function normalizePhone(phone: string): string {
  return phone.replace(/[\s().-]/g, "");
}

function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();

  if (!/^\+?[0-9\s().-]+$/.test(trimmed)) {
    return false;
  }

  const normalized = normalizePhone(trimmed);
  const digits = normalized.replace(/^\+/, "");

  return /^\+?\d+$/.test(normalized) && digits.length >= 8 && digits.length <= 15;
}

export async function GET() {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  await initDb();

  const customers = await Customer.findAll({
    order: [["name", "ASC"]],
  });

  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    await initDb();

    const form = await req.formData();

    const nameValue = form.get("name");
    const phoneValue = form.get("phone");
    const addressValue = form.get("address");

    if (
      typeof nameValue !== "string" ||
      typeof phoneValue !== "string" ||
      (addressValue !== null && typeof addressValue !== "string")
    ) {
      return NextResponse.json(
        { message: "Data pelanggan tidak valid." },
        { status: 400 },
      );
    }

    const name = nameValue.trim();
    const phone = normalizePhone(phoneValue.trim());
    const address =
      typeof addressValue === "string" ? addressValue.trim() : "";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { message: "Nama pelanggan harus terdiri dari 2–120 karakter." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phoneValue)) {
      return NextResponse.json(
        {
          message:
            "Nomor WhatsApp tidak valid. Masukkan 8–15 digit angka dengan format yang benar.",
        },
        { status: 400 },
      );
    }

    const parsed = customerSchema.safeParse({
      name,
      phone,
      address: address || null,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Data pelanggan tidak valid. Periksa kembali isian Anda." },
        { status: 400 },
      );
    }

    const existingCustomers = await Customer.findAll({
      attributes: ["id", "phone"],
    });

    const duplicate = existingCustomers.some(
      (customer) =>
        normalizePhone(customer.phone) === phone,
    );

    if (duplicate) {
      return NextResponse.json(
        { message: "Nomor WhatsApp sudah terdaftar." },
        { status: 409 },
      );
    }

    await Customer.create({
      ...parsed.data,
      name,
      phone,
      address: address || null,
    });

    return NextResponse.json(
      { message: "Pelanggan berhasil ditambahkan." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan pelanggan." },
      { status: 500 },
    );
  }
}
