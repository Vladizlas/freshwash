import bwipjs from "bwip-js";
import { initDb } from "@/lib/db";
import { LaundryTransaction } from "@/models";
import { requireUser } from "@/lib/http";

// Fitur barcode: hasilkan barcode Code 128 untuk nomor invoice yang benar-benar tersimpan.
export const runtime = "nodejs";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoice: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return new Response("Silakan login.", { status: 401 });
  try {
    await initDb();
    const { invoice } = await params;
    const tx = await LaundryTransaction.findOne({
      where: { invoiceNumber: invoice },
    });
    if (!tx) return new Response("Invoice tidak ditemukan", { status: 404 });
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: tx.invoiceNumber,
      scale: 2,
      height: 12,
      includetext: true,
      textxalign: "center",
    });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Gagal membuat barcode", { status: 500 });
  }
}
