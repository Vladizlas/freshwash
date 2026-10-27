import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import "./globals.css";

// Layout global untuk metadata dan navigasi bersama seluruh fitur aplikasi.
export const metadata: Metadata = {
  title: "FreshWash — Laundry Management",
  description: "Sistem operasional laundry kiloan dan dry clean",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="id" className="scheme-light">
      <body className="m-0 bg-slate-50 font-sans text-slate-900 print:bg-white">
        <AppShell role={session?.role ?? null} userName={session?.name ?? null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
