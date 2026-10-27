
"use client";

import { useState } from "react";

type PackageData = {
  id: number;
  name: string;
  serviceType: string;
  speed: string;
  pricePerKg: number;
  estimatedHours: number;
  active: boolean;
};

type ItemData = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

type Props = {
  packages: PackageData[];
  items: ItemData[];
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ServicesManager({
  packages,
  items,
}: Props) {
  const [tab, setTab] = useState<"packages" | "items">("packages");
  const [modal, setModal] = useState<
    | { type: "add-package" }
    | { type: "edit-package"; data: PackageData }
    | { type: "add-item" }
    | { type: "edit-item"; data: ItemData }
    | null
  >(null);

  function removePackage(p: PackageData) {
    if (
      !window.confirm(
        `Nonaktifkan paket "${p.name}"? Paket tidak akan tersedia untuk transaksi baru.`,
      )
    )
      return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/services/packages/${p.id}`;

    const fields: Record<string, string> = {
      name: p.name,
      pricePerKg: String(p.pricePerKg),
      estimatedHours: String(p.estimatedHours),
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  function removeItem(item: ItemData) {
    if (
      !window.confirm(
        `Nonaktifkan item "${item.name}"? Item tidak akan tersedia untuk transaksi baru.`,
      )
    )
      return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/services/items/${item.id}`;

    const fields: Record<string, string> = {
      name: item.name,
      price: String(item.price),
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  const buttonClass =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition";

  return (
    <>
      <header className="mb-7">

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              Administrator / Pemilik Usaha
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Paket & Tarif Laundry
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola harga layanan kiloan dan cucian satuan.
            </p>
          </div>

          <button
            onClick={() =>
              setModal(
                tab === "packages"
                  ? { type: "add-package" }
                  : { type: "add-item" },
              )
            }
            className={`${buttonClass} bg-cyan-700 text-white hover:bg-cyan-800`}
          >
            + {tab === "packages" ? "Tambah Paket" : "Tambah Item"}
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 border-b border-slate-200 px-4 pt-4">
          <button
            onClick={() => setTab("packages")}
            className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${
              tab === "packages"
                ? "border-b-2 border-cyan-700 text-cyan-800"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Paket Kiloan ({packages.length})
          </button>

          <button
            onClick={() => setTab("items")}
            className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${
              tab === "items"
                ? "border-b-2 border-cyan-700 text-cyan-800"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Tarif Satuan ({items.length})
          </button>
        </div>

        {tab === "packages" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nama paket</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Kecepatan</th>
                  <th className="px-5 py-4">Tarif / kg</th>
                  <th className="px-5 py-4">Estimasi</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.serviceType === "kiloan"
                        ? "Kiloan"
                        : "Dry clean"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.speed === "regular" ? "Reguler" : "Express"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {money(p.pricePerKg)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.estimatedHours} jam
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setModal({ type: "edit-package", data: p })
                          }
                          className={`${buttonClass} bg-cyan-50 text-cyan-800 hover:bg-cyan-100`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removePackage(p)}
                          disabled={!p.active}
                          className={`${buttonClass} bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Belum ada paket layanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nama item</th>
                  <th className="px-5 py-4">Harga / item</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {money(item.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setModal({ type: "edit-item", data: item })
                          }
                          className={`${buttonClass} bg-cyan-50 text-cyan-800 hover:bg-cyan-100`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeItem(item)}
                          disabled={!item.active}
                          className={`${buttonClass} bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Belum ada tarif cucian satuan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modal.type.startsWith("add")
                    ? "Tambah layanan"
                    : "Edit layanan"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi data layanan di bawah ini.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                aria-label="Tutup modal"
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {(modal.type === "add-package" ||
                modal.type === "edit-package") && (
                <form
                  key={
                    modal.type === "edit-package"
                      ? `edit-package-${modal.data.id}`
                      : "add-package"
                  }
                  action={
                    modal.type === "edit-package"
                      ? `/api/services/packages/${modal.data.id}`
                      : "/api/services/packages"
                  }
                  method="post"
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium text-slate-700">
                    Nama paket
                    <input
                      className={inputClass}
                      name="name"
                      required
                      minLength={3}
                      defaultValue={
                        modal.type === "edit-package"
                          ? modal.data.name
                          : ""
                      }
                      placeholder="Contoh: Cuci Setrika Reguler"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Jenis layanan
                      <select
                        className={inputClass}
                        name="serviceType"
                        defaultValue={
                          modal.type === "edit-package"
                            ? modal.data.serviceType
                            : "kiloan"
                        }
                        disabled={modal.type === "edit-package"}
                      >
                        <option value="kiloan">Kiloan</option>
                        <option value="dry_clean">Dry clean</option>
                      </select>
                      {modal.type === "edit-package" && (
                        <input
                          type="hidden"
                          name="serviceType"
                          value={modal.data.serviceType}
                        />
                      )}
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Kecepatan
                      <select
                        className={inputClass}
                        name="speed"
                        defaultValue={
                          modal.type === "edit-package"
                            ? modal.data.speed
                            : "regular"
                        }
                        disabled={modal.type === "edit-package"}
                      >
                        <option value="regular">Reguler</option>
                        <option value="express">Express</option>
                      </select>
                      {modal.type === "edit-package" && (
                        <input
                          type="hidden"
                          name="speed"
                          value={modal.data.speed}
                        />
                      )}
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Tarif per kg (Rp)
                      <input
                        className={inputClass}
                        name="pricePerKg"
                        type="number"
                        min="1"
                        required
                        defaultValue={
                          modal.type === "edit-package"
                            ? modal.data.pricePerKg
                            : ""
                        }
                      />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Estimasi selesai (jam)
                      <input
                        className={inputClass}
                        name="estimatedHours"
                        type="number"
                        min="1"
                        max="720"
                        required
                        defaultValue={
                          modal.type === "edit-package"
                            ? modal.data.estimatedHours
                            : 24
                        }
                      />
                    </label>
                  </div>

                  {modal.type === "edit-package" && (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="active"
                        value="true"
                        defaultChecked={modal.data.active}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-700"
                      />
                      Paket aktif
                    </label>
                  )}

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                    >
                      Batal
                    </button>
                    <button
                      className={`${buttonClass} bg-cyan-700 text-white hover:bg-cyan-800`}
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {(modal.type === "add-item" ||
                modal.type === "edit-item") && (
                <form
                  key={
                    modal.type === "edit-item"
                      ? `edit-item-${modal.data.id}`
                      : "add-item"
                  }
                  action={
                    modal.type === "edit-item"
                      ? `/api/services/items/${modal.data.id}`
                      : "/api/services/items"
                  }
                  method="post"
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium text-slate-700">
                    Nama item
                    <input
                      className={inputClass}
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      defaultValue={
                        modal.type === "edit-item"
                          ? modal.data.name
                          : ""
                      }
                      placeholder="Contoh: Bedcover King"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Harga per item (Rp)
                    <input
                      className={inputClass}
                      name="price"
                      type="number"
                      min="1"
                      required
                      defaultValue={
                        modal.type === "edit-item"
                          ? modal.data.price
                          : ""
                      }
                    />
                  </label>

                  {modal.type === "edit-item" && (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="active"
                        value="true"
                        defaultChecked={modal.data.active}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-700"
                      />
                      Item aktif
                    </label>
                  )}

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                    >
                      Batal
                    </button>
                    <button
                      className={`${buttonClass} bg-cyan-700 text-white hover:bg-cyan-800`}
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
