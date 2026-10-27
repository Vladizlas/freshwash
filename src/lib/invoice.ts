import { randomInt } from "node:crypto";
import { LaundryTransaction } from "@/models";

// Fitur nomor invoice: format NOT-LDY-YYYYMMDD-XXXX.
// Unique constraint di database menjadi lapisan perlindungan tambahan jika terjadi tabrakan.
export async function generateInvoiceNumber() {
  const date = new Date();
  const day = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  for (let attempt = 0; attempt < 10; attempt++) {
    const invoice = `NOT-LDY-${day}-${String(randomInt(0, 10000)).padStart(4, "0")}`;
    const exists = await LaundryTransaction.findOne({
      where: { invoiceNumber: invoice },
    });
    if (!exists) return invoice;
  }
  throw new Error("Gagal membuat nomor invoice unik. Coba lagi.");
}
