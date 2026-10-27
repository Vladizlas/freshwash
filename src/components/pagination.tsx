
import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  basePath: string;
  query?: Record<string, string>;
};

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  basePath,
  query = {},
}: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200
      px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Menampilkan <strong>{start}–{end}</strong> dari{" "}
        <strong>{totalItems}</strong> data
      </p>

      <nav aria-label="Navigasi halaman" className="flex flex-wrap gap-1">
        <Link
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={`rounded-lg border px-3 py-2 text-sm ${
            page <= 1
              ? "pointer-events-none opacity-40"
              : "hover:bg-slate-50"
          }`}
          href={pageHref(Math.max(1, page - 1))}
        >
          Sebelumnya
        </Link>

        {pages.map((number) => (
          <Link
            key={number}
            href={pageHref(number)}
            aria-current={number === page ? "page" : undefined}
            className={`rounded-lg border px-3 py-2 text-sm ${
              number === page
                ? "border-cyan-600 bg-cyan-600 font-bold text-white"
                : "hover:bg-slate-50"
            }`}
          >
            {number}
          </Link>
        ))}

        <Link
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={`rounded-lg border px-3 py-2 text-sm ${
            page >= totalPages
              ? "pointer-events-none opacity-40"
              : "hover:bg-slate-50"
          }`}
          href={pageHref(Math.min(totalPages, page + 1))}
        >
          Berikutnya
        </Link>
      </nav>
    </div>
  );
}
