import { Sequelize } from "sequelize";

const globalForSequelize = globalThis as typeof globalThis & {
  sequelize?: Sequelize;
};
export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(
    process.env.DB_NAME ?? "freshwash",
    process.env.DB_USER ?? "root",
    process.env.DB_PASSWORD ?? "",
    {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 3306),
      dialect: "mysql",
      logging: false,
    },
  );
if (process.env.NODE_ENV !== "production")
  globalForSequelize.sequelize = sequelize;

let syncPromise: Promise<void> | null = null;
export async function initDb() {
  if (!syncPromise) {
    syncPromise = (async () => {
      const {
        User,
        Customer,
        LaundryTransaction,
        Payment,
        ProcessHistory,
        LaundryPackage,
        UnitItem,
        LaundryOrderItem,
      } = await import("@/models");
      void User;
      void Customer;
      void LaundryTransaction;
      void Payment;
      void ProcessHistory;
      void LaundryOrderItem;
      // Untuk proyek praktik lokal, alter menambahkan kolom/tabel yang dibutuhkan PDF pada DB yang sudah ada.
      await sequelize.sync({ alter: true });
      const packages = [
        {
          name: "Cuci Kering Lipat - Reguler",
          serviceType: "kiloan" as const,
          speed: "regular" as const,
          pricePerKg: 7000,
          estimatedHours: 48,
        },
        {
          name: "Cuci Setrika Komplit - Reguler",
          serviceType: "kiloan" as const,
          speed: "regular" as const,
          pricePerKg: 9000,
          estimatedHours: 48,
        },
        {
          name: "Setrika Saja - Reguler",
          serviceType: "kiloan" as const,
          speed: "regular" as const,
          pricePerKg: 6000,
          estimatedHours: 48,
        },
        {
          name: "Cuci Kering Lipat - Kilat",
          serviceType: "kiloan" as const,
          speed: "express" as const,
          pricePerKg: 10000,
          estimatedHours: 24,
        },
        {
          name: "Cuci Setrika Komplit - Express",
          serviceType: "kiloan" as const,
          speed: "express" as const,
          pricePerKg: 13000,
          estimatedHours: 6,
        },
      ];
      for (const item of packages)
        await LaundryPackage.findOrCreate({
          where: { name: item.name },
          defaults: item,
        });
      const unitItems = [
        { name: "Bedcover King", price: 35000 },
        { name: "Selimut", price: 20000 },
        { name: "Jas Pria", price: 30000 },
        { name: "Boneka Besar", price: 25000 },
      ];
      for (const item of unitItems)
        await UnitItem.findOrCreate({
          where: { name: item.name },
          defaults: item,
        });
    })().catch((error) => {
      syncPromise = null;
      throw error;
    });
  }
  await syncPromise;
}
