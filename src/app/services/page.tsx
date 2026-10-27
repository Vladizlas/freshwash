
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { LaundryPackage, UnitItem } from "@/models";
import ServicesManager from "./ServiceManager";

export default async function ServicesPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  await initDb();

  const [packages, items] = await Promise.all([
    LaundryPackage.findAll({ order: [["name", "ASC"]] }),
    UnitItem.findAll({ order: [["name", "ASC"]] }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-slate-50 p-4 sm:p-6 lg:p-8">
      <ServicesManager
        packages={packages.map((p) => ({
          id: p.id,
          name: p.name,
          serviceType: p.serviceType,
          speed: p.speed,
          pricePerKg: Number(p.pricePerKg),
          estimatedHours: p.estimatedHours,
          active: p.active,
        }))}
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          active: i.active,
        }))}
      />
    </main>
  );
}
