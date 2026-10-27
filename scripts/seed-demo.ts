import bcrypt from "bcryptjs";
import { initDb } from "@/lib/db";
import { Customer, User } from "@/models";

async function seed() {
  await initDb();
  const accounts = [
    {
      name: "Administrator FreshWash",
      email: "admin@freshwash.local",
      password: "FreshWashAdmin123!",
      role: "admin" as const,
    },
    {
      name: "Kasir FreshWash",
      email: "kasir@freshwash.local",
      password: "FreshWashKasir123!",
      role: "cashier" as const,
    },
  ];
  for (const account of accounts) {
    const existing = await User.findOne({ where: { email: account.email } });
    if (!existing)
      await User.create({
        name: account.name,
        email: account.email,
        passwordHash: await bcrypt.hash(account.password, 12),
        role: account.role,
      });
  }
  await Customer.findOrCreate({
    where: { phone: "081234567890" },
    defaults: {
      name: "Pelanggan Demo",
      phone: "081234567890",
      address: "Alamat contoh",
    },
  });
  console.log("Data demo siap. Akun demo tercantum di README.md.");
  process.exit(0);
}
seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
