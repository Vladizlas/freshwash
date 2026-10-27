
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/", mark: "⌂" },
  { label: "Transaksi", href: "/transactions", mark: "▤" },
  { label: "Transaksi baru", href: "/transactions/new", mark: "+" },
  { label: "Pelanggan", href: "/customers", mark: "♙" },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";

  if (href === "/transactions") {
    return (
      pathname === href ||
      /^\/transactions\/\d+$/.test(pathname)
    );
  }

  if (href === "/customers") {
    return (
      pathname === href ||
      pathname === "/customers/new" ||
      /^\/customers\/\d+\/edit$/.test(pathname)
    );
  }

  if (href === "/reports") {
    return pathname === href || pathname === "/reports/print";
  }

  return pathname === href;
};

export default function AppShell({
  children,
  role,
  userName,
}: {
  children: ReactNode;
  role: "admin" | "cashier" | null;
  userName: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublicPage =
    pathname === "/login" || pathname === "/setup";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  if (isPublicPage) return <>{children}</>;

  
const menuItems = [
  ...navigation,
  ...(role === "admin"
    ? [
      { label: "Paket & Tarif", href: "/services", mark: "◇" },
      { label: "Laporan", href: "/reports", mark: "▥" },
      { label: "Manajemen Pegawai", href: "/users", mark: "♙" },
    ]
    : []),
    { label: "Profil Saya", href: "/profile", mark: "◎" },
];



return (
  <div className="min-h-screen lg:flex">
    {/* Header: burger hanya tampil di layar kecil */}
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3
      border-b border-slate-200 bg-white px-4 lg:hidden print:hidden">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={menuOpen}
        className="flex h-10 w-10 items-center justify-center
          rounded-xl border border-slate-200 text-xl"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <Link href="/" className="font-extrabold text-cyan-700">
        FreshWash
      </Link>
    </header>

    {/* Overlay hanya saat sidebar mobile terbuka */}
    {menuOpen && (
      <button
        type="button"
        aria-label="Tutup menu"
        onClick={() => setMenuOpen(false)}
        className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden print:hidden"
      />
    )}

    {/* Sidebar: drawer di mobile, permanen di desktop */}
    <aside
      id="app-sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
        flex-col border-r border-slate-200 bg-white px-[18px] py-6
        shadow-xl transition-transform duration-300
        lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:shrink-0
        lg:translate-x-0 lg:shadow-none print:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center
            rounded-2xl bg-cyan-600 text-lg font-extrabold text-white">
            F
          </span>
          <span>
            <span className="block text-lg font-extrabold text-slate-900">
              FreshWash
            </span>
            <span className="block text-xs text-slate-500">
              Laundry management
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup sidebar"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          ✕
        </button>
      </div>

      <p className="mb-2 px-3 text-[11px] font-bold uppercase
        tracking-widest text-slate-400">
        Menu utama
      </p>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              tabIndex={menuOpen || undefined ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-xl
                px-3 py-2.5 text-sm font-semibold no-underline ${
                  active
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-cyan-700"
                }`}
            >
              <span className="flex h-8 w-8 items-center justify-center
                rounded-lg bg-slate-100">
                {item.mark}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-cyan-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {userName && (
          <div className="mb-3 rounded-2xl bg-cyan-50 p-4">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="mt-1 text-xs text-cyan-800">
              {role === "admin"
                ? "Administrator / Pemilik Usaha"
                : "Front Desk / Operator Kasir"}
            </p>
          </div>
        )}

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-xl border border-rose-100
              px-3 py-2.5 text-left text-sm font-semibold text-rose-700
              hover:bg-rose-50"
          >
            ↪ Logout
          </button>
        </form>
      </div>
    </aside>

    {/* Konten halaman */}
    <div className="min-w-0 flex-1">
      {children}
    </div>
  </div>
);

}
