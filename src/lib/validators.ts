import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  address: z.string().trim().max(2000).optional().or(z.literal("")),
});
export const transactionSchema = z
  .object({
    customerId: z.coerce.number().int().positive(),
    packageId: z.coerce.number().int().positive().optional(),
    weightKg: z.coerce.number().positive().max(500).optional(),
    discount: z.coerce.number().min(0).max(100000000).default(0),
    notes: z.string().max(2000).optional(),
    paymentChoice: z.enum(["paid", "unpaid"]).default("unpaid"),
    initialPayment: z.coerce.number().min(0).max(100000000).default(0),
    itemIds: z.array(z.coerce.number().int().positive()).default([]),
    itemQuantities: z
      .array(z.coerce.number().int().positive().max(100))
      .default([]),
  })
  .refine((d) => d.packageId !== undefined || d.itemIds.length > 0, {
    message: "Pilih paket kiloan atau minimal satu item satuan.",
  })
  .refine(
    (d) =>
      d.packageId === undefined ||
      (d.weightKg !== undefined && d.weightKg >= 3),
    { message: "Berat minimal layanan kiloan adalah 3 kg." },
  );
