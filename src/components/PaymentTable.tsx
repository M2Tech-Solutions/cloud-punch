import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, Check, X } from "lucide-react";
import type { WorktimeType } from "@db/schema";
import { PUT as updateWorktime } from "@api/admin/worktime";

export type PaymentRecord = {
  id: number;
  userId: string;
  employeeName: string;
  fromDate: Date;
  toDate: Date;
  status: WorktimeType["status"];
};

type GroupedRecord = {
  ids: number[];
  userId: string;
  employeeName: string;
  fromDate: Date;
  toDate: Date;
  totalHours: string;
  totalAmount: number;
  status: WorktimeType["status"];
};

interface PaymentTableProps {
  data: PaymentRecord[];
  hourlyRates: Record<string, number>;
  onToggleStatus: (ids: number[], status: WorktimeType["status"]) => void;
}

function getISOWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${week}`;
}

function formatHours(ms: number): string {
  const totalMinutes = Math.round(ms / (1000 * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function PaymentTable({
  data,
  hourlyRates,
  onToggleStatus,
}: PaymentTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorktimeType["status"] | "">("");
  const [pendingChange, setPendingChange] = useState<{
    key: string;
    ids: number[];
    newStatus: WorktimeType["status"];
  } | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const handleConfirmStatus = async () => {
    if (!pendingChange) return;
    setSavingStatus(true);
    await Promise.all(
      pendingChange.ids.map((id) =>
        updateWorktime(id, { status: pendingChange.newStatus }),
      ),
    );
    onToggleStatus(pendingChange.ids, pendingChange.newStatus);
    setPendingChange(null);
    setSavingStatus(false);
  };

  const filteredData = useMemo(() => {
    let result = data || [];
    if (dateFilter) {
      result = result.filter(
        (item) =>
          item.fromDate.toISOString().includes(dateFilter) ||
          item.toDate.toISOString().includes(dateFilter),
      );
    }
    return result;
  }, [data, dateFilter]);

  const groupedData = useMemo<GroupedRecord[]>(() => {
    const groups = new Map<string, PaymentRecord[]>();
    for (const rec of filteredData) {
      const key = `${rec.employeeName}__${getISOWeekKey(rec.fromDate)}`;
      const existing = groups.get(key) ?? [];
      existing.push(rec);
      groups.set(key, existing);
    }
    return Array.from(groups.values()).map((group) => {
      const totalMs = group.reduce(
        (sum, r) => sum + (r.toDate.getTime() - r.fromDate.getTime()),
        0,
      );
      const userId = group[0]!.userId;
      const salaryPerHour = hourlyRates[userId] ?? 0;
      const totalAmount = (totalMs / 3600000) * salaryPerHour;
      return {
        ids: group.map((r) => r.id),
        userId,
        employeeName: group[0]!.employeeName,
        fromDate: new Date(Math.min(...group.map((r) => r.fromDate.getTime()))),
        toDate: new Date(Math.max(...group.map((r) => r.toDate.getTime()))),
        totalHours: formatHours(totalMs),
        totalAmount,
        status: group[0]!.status,
      };
    });
  }, [filteredData, hourlyRates]);

  const displayData = useMemo(
    () => (statusFilter ? groupedData.filter((r) => r.status === statusFilter) : groupedData),
    [groupedData, statusFilter],
  );

  const columns = useMemo<ColumnDef<GroupedRecord>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employé",
        cell: (info) => (
          <span className="font-medium text-slate-900 dark:text-white">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        id: "period",
        header: "Période",
        cell: (info) => {
          const { fromDate, toDate } = info.row.original;
          const fmt = (d: Date) =>
            d.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            });
          return (
            <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {fmt(fromDate)} — {fmt(toDate)} {toDate.getFullYear()}
            </span>
          );
        },
      },
      {
        accessorKey: "totalHours",
        header: "Heures",
        cell: (info) => (
          <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Montant",
        cell: (info) => {
          const amount = info.getValue() as number;
          if (amount === 0)
            return (
              <span className="text-slate-300 dark:text-slate-600">—</span>
            );
          return (
            <span className="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {amount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "CAD",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: (info) => {
          const currentStatus = info.getValue() as WorktimeType["status"];
          const { ids } = info.row.original;
          const rowKey = ids.join(",");
          const isPending = pendingChange?.key === rowKey;
          const isSaving = isPending && savingStatus;
          const displayStatus = isPending ? pendingChange!.newStatus : currentStatus;

          return (
            <div className="flex items-center gap-1.5">
              <select
                value={displayStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as WorktimeType["status"];
                  if (newStatus !== currentStatus) {
                    setPendingChange({ key: rowKey, ids, newStatus });
                  } else {
                    setPendingChange(null);
                  }
                }}
                disabled={isSaving}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border outline-none appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
                  displayStatus === "fulfilled"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    : displayStatus === "approved"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                    : displayStatus === "rejected"
                    ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20"
                }`}
              >
                <option value="pending" className="bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500">En attente</option>
                <option value="approved" className="bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400">Approuvé</option>
                <option value="fulfilled" className="bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">Payé</option>
                <option value="rejected" className="bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400">Rejeté</option>
              </select>

              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={handleConfirmStatus}
                    disabled={isSaving}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    title="Confirmer"
                  >
                    {isSaving ? (
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={11} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingChange(null)}
                    disabled={isSaving}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Annuler"
                  >
                    <X size={11} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [onToggleStatus, pendingChange, savingStatus, handleConfirmStatus],
  );

  const table = useReactTable({
    data: displayData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col w-full">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white dark:bg-white/5 pl-10 p-2 rounded-lg border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all text-sm"
            placeholder="Filtrer par employé..."
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Filtre Date
          </label>
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-900 dark:text-white outline-none transition-all text-sm"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-2"
            >
              Effacer
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorktimeType["status"] | "")}
            className="bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-900 dark:text-white outline-none appearance-none transition-all text-sm"
          >
            <option value="" className="bg-white dark:bg-zinc-800">Tous</option>
            <option value="pending" className="bg-white dark:bg-zinc-800">En attente</option>
            <option value="approved" className="bg-white dark:bg-zinc-800">Approuvé</option>
            <option value="fulfilled" className="bg-white dark:bg-zinc-800">Payé</option>
            <option value="rejected" className="bg-white dark:bg-zinc-800">Rejeté</option>
          </select>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter("")}
              className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm text-slate-600 dark:text-slate-300">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-slate-400 dark:text-slate-500"
                >
                  Aucun paiement trouvé...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          <div>Page</div>
          <strong className="text-slate-700 dark:text-slate-200">
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 text-slate-700 dark:text-white transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </button>
          <button
            className="px-3 py-1 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 text-slate-700 dark:text-white transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
