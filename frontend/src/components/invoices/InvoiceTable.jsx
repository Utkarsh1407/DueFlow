import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Pencil,
  Trash2,
  Bell,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "./StatusBadge";
import DueDateLabel from "./DueDateLabel";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

const COLUMNS = [
  { key: "clientName", label: "Client", sortable: true },
  { key: "amount", label: "Amount", sortable: true, align: "right" },
  { key: "status", label: "Status", sortable: false },
  { key: "dueDate", label: "Due Date", sortable: true },
  { key: "createdAt", label: "Issued", sortable: true },
  { key: "reminders", label: "Reminders", sortable: false, align: "center" },
  { key: "actions", label: "", sortable: false },
];

function SortIcon({ col, sortBy }) {
  const [field, dir] = (sortBy ?? "").split("_");
  if (field !== col) return <ArrowUpDown size={12} className="text-slate-300 ml-1" />;
  return dir === "asc" ? (
    <ArrowUp size={12} className="text-slate-600 ml-1" />
  ) : (
    <ArrowDown size={12} className="text-slate-600 ml-1" />
  );
}

function LoadingRows({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <TableRow key={i} className="hover:bg-transparent">
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-3.5 w-8 mx-auto" />
      </TableCell>
      <TableCell />
    </TableRow>
  ));
}

/**
 * InvoiceTable
 * @param {object[]} invoices
 * @param {boolean} loading
 * @param {string} sortBy - e.g. "dueDate_asc"
 * @param {function} onSortChange
 * @param {function} onDelete - (invoice) => void
 * @param {function} onRemind - async (invoiceId) => void
 */
export default function InvoiceTable({
  invoices = [],
  loading = false,
  sortBy,
  onSortChange,
  onDelete,
  onRemind,
}) {
  const [remindingId, setRemindingId] = useState(null);

  function handleSort(col) {
    const [field, dir] = (sortBy ?? "").split("_");
    const nextDir = field === col && dir === "asc" ? "desc" : "asc";
    onSortChange?.(`${col}_${nextDir}`);
  }

  async function handleRemind(invoice) {
    try {
      setRemindingId(invoice.id);
      await onRemind?.(invoice.id);
    } finally {
      setRemindingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-slate-100 bg-slate-50/60">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold text-slate-500 uppercase tracking-wider h-10 px-4",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable && "cursor-pointer select-none hover:text-slate-800 transition-colors"
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  {col.sortable && <SortIcon col={col.key} sortBy={sortBy} />}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <LoadingRows />
          ) : invoices.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMNS.length} className="py-16">
                <EmptyState
                  icon="receipt"
                  title="No invoices found"
                  description="Try adjusting your filters or create a new invoice to get started."
                  action={{ label: "Create Invoice", href: "/invoices/new" }}
                />
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow
                key={inv.id}
                className={cn(
                  "group border-b border-slate-50 last:border-0 transition-colors",
                  inv.status === "OVERDUE" && "bg-red-50/30 hover:bg-red-50/50"
                )}
              >
                {/* Client */}
                <TableCell className="px-4 py-3">
                  <Link to={`/invoices/${inv.id}`} className="block group/link">
                    <p className="text-sm font-semibold text-slate-900 group-hover/link:text-slate-600 transition-colors truncate max-w-[180px]">
                      {inv.clientName}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
                      {inv.clientEmail}
                    </p>
                  </Link>
                </TableCell>

                {/* Amount */}
                <TableCell className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCurrency(inv.amount)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3">
                  <StatusBadge status={inv.status} size="sm" />
                </TableCell>

                {/* Due date */}
                <TableCell className="px-4 py-3">
                  <DueDateLabel dueDate={inv.dueDate} status={inv.status} variant="badge" />
                </TableCell>

                {/* Issued */}
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {formatDate(inv.createdAt)}
                  </span>
                </TableCell>

                {/* Reminder count */}
                <TableCell className="px-4 py-3 text-center">
                  {inv._count?.reminders > 0 ? (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5">
                      {inv._count.reminders}
                    </span>
                  ) : (
                    <span className="text-slate-200 text-xs">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {inv.status !== "PAID" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Send reminder"
                        onClick={() => handleRemind(inv)}
                        disabled={remindingId === inv.id}
                        className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        {remindingId === inv.id ? (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                        ) : (
                          <Bell size={13} />
                        )}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/invoices/${inv.id}`}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Eye size={13} />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/invoices/${inv.id}/edit`}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Pencil size={13} />
                            Edit Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(inv)}
                          className="flex items-center gap-2 text-sm text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}