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
  if (field !== col)
    return (
      <ArrowUpDown
        size={12}
        className="ml-1"
        style={{ color: "var(--color-border-strong)" }}
      />
    );
  return dir === "asc" ? (
    <ArrowUp size={12} className="ml-1" style={{ color: "var(--color-text-secondary)" }} />
  ) : (
    <ArrowDown size={12} className="ml-1" style={{ color: "var(--color-text-secondary)" }} />
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
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow
            className="hover:bg-transparent"
            style={{
              borderBottomColor: "var(--color-border)",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          >
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider h-10 px-4 transition-colors",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable && "cursor-pointer select-none"
                )}
                style={{ color: "var(--color-text-tertiary)" }}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                onMouseEnter={
                  col.sortable
                    ? (e) => (e.currentTarget.style.color = "var(--color-text-primary)")
                    : undefined
                }
                onMouseLeave={
                  col.sortable
                    ? (e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")
                    : undefined
                }
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
                className="group last:border-0 transition-colors"
                style={{
                  borderBottomColor: "var(--color-border)",
                  backgroundColor:
                    inv.status === "OVERDUE" ? "var(--color-overdue-bg)" : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    inv.status === "OVERDUE"
                      ? "color-mix(in srgb, var(--color-overdue-bg) 80%, var(--color-bg-hover))"
                      : "var(--color-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    inv.status === "OVERDUE" ? "var(--color-overdue-bg)" : "";
                }}
              >
                {/* Client */}
                <TableCell className="px-4 py-3">
                  <Link to={`/dashboard/invoices/${inv.id}`} className="block group/link">
                    <p
                      className="text-sm font-semibold truncate max-w-[180px] transition-colors"
                      style={{ color: "var(--color-text-primary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-text-secondary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--color-text-primary)")
                      }
                    >
                      {inv.clientName}
                    </p>
                    <p
                      className="text-xs truncate max-w-[200px] mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {inv.clientEmail}
                    </p>
                  </Link>
                </TableCell>

                {/* Amount */}
                <TableCell className="px-4 py-3 text-right">
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: "var(--color-text-primary)" }}
                  >
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
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {formatDate(inv.createdAt)}
                  </span>
                </TableCell>

                {/* Reminder count */}
                <TableCell className="px-4 py-3 text-center">
                  {inv._count?.reminders > 0 ? (
                    <span
                      className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-semibold px-1.5"
                      style={{
                        backgroundColor: "var(--color-bg-hover)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {inv._count.reminders}
                    </span>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-border-strong)" }}
                    >
                      —
                    </span>
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
                        className="h-7 w-7 transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--color-text-primary)";
                          e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--color-text-muted)";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {remindingId === inv.id ? (
                          <span
                            className="h-3.5 w-3.5 rounded-full border-2 animate-spin"
                            style={{
                              borderColor: "var(--color-border-strong)",
                              borderTopColor: "var(--color-text-primary)",
                            }}
                          />
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
                          className="h-7 w-7 transition-colors"
                          style={{ color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--color-text-primary)";
                            e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--color-text-muted)";
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44"
                        style={{
                          backgroundColor: "var(--color-bg-card)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/invoices/${inv.id}`}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            <Eye size={13} />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/invoices/${inv.id}/edit`}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            <Pencil size={13} />
                            Edit Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator
                          style={{ backgroundColor: "var(--color-border)" }}
                        />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(inv)}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "var(--color-overdue-text)" }}
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