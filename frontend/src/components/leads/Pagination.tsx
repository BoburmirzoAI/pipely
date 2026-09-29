import { Icon } from "../Icon";
import { Popover } from "../Popover";

const PAGE_SIZES = [10, 20, 50, 100];

function pageWindow(page: number, totalPages: number): number[] {
  const span = 3;
  let start = Math.max(1, page - Math.floor(span / 2));
  const end = Math.min(totalPages, start + span - 1);
  start = Math.max(1, end - span + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPage: (n: number) => void;
  onPageSize: (n: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageBtn =
    "flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-medium";

  return (
    <div className="flex h-13 flex-none items-center justify-between border-t border-line px-5 py-2.5 text-[13px] text-gray-500">
      <div>
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of {total}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          Rows per page
          <Popover
            width={90}
            trigger={() => (
              <button className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1 font-medium text-ink">
                {pageSize}
                <Icon name="chevdown" size={12} stroke="#9CA3AF" />
              </button>
            )}
          >
            {(close) => (
              <div className="flex flex-col">
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onPageSize(s);
                      close();
                    }}
                    className="rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Popover>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className={`${pageBtn} border border-line bg-white text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300`}
          >
            <Icon name="chevleft" size={15} />
          </button>
          {pageWindow(page, totalPages).map((n) => (
            <button
              key={n}
              onClick={() => onPage(n)}
              className={
                n === page
                  ? `${pageBtn} bg-brand text-white`
                  : `${pageBtn} border border-line bg-white text-gray-700 hover:bg-[#FAFAFB]`
              }
            >
              {n}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            className={`${pageBtn} border border-line bg-white text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300`}
          >
            <Icon name="chevright" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
