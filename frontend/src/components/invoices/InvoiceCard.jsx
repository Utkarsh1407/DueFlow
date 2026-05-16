import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Eye, Pencil, Trash2, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import DueDateLabel from "./DueDateLabel";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * InvoiceCard - card layout for grid/mobile views
 * @param {object} invoice
 * @param {function} onDelete
 * @param {function} onRemind
 */
export default function InvoiceCard({ invoice, onDelete, onRemind, className }) {
  const [reminding, setReminding] = useState(false);

  async function handleRemind(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      setReminding(true);
      await onRemind?.(invoice.id);
    } finally {
      setReminding(false);
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
        className
      )}
      style={{
        backgroundColor: invoice.status === "OVERDUE"
          ? "var(--color-overdue-bg)"
          : "var(--color-bg-card)",
        borderColor: invoice.status === "OVERDUE"
          ? "var(--color-overdue)"
          : "var(--color-border)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/invoices/${invoice.id}`}
            className="block font-semibold text-sm truncate transition-colors"
            style={{ color: "var(--color-text-primary)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-secondary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-primary)"}
          >
            {invoice.clientName}
          </Link>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {invoice.clientEmail}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={invoice.status} size="sm" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mr-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                <MoreVertical size={14} />
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
                  to={`/invoices/${invoice.id}`}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Eye size={13} />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/invoices/${invoice.id}/edit`}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Pencil size={13} />
                  Edit
                </Link>
              </DropdownMenuItem>
              {invoice.status !== "PAID" && (
                <DropdownMenuItem
                  onClick={handleRemind}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <Bell size={13} />
                  Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ backgroundColor: "var(--color-border)" }} />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(invoice);
                }}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-overdue-text)" }}
              >
                <Trash2 size={13} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>Amount</p>
          <p className="text-xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            {formatCurrency(invoice.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>Issued</p>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {formatDate(invoice.createdAt)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <DueDateLabel dueDate={invoice.dueDate} status={invoice.status} variant="full" />

        {invoice.status !== "PAID" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemind}
            disabled={reminding}
            className="h-7 text-xs gap-1 px-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {reminding ? (
              <span
                className="h-3 w-3 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "var(--color-border-strong)",
                  borderTopColor: "var(--color-text-primary)",
                }}
              />
            ) : (
              <Bell size={11} />
            )}
            Remind
          </Button>
        )}
      </div>

      {/* Reminder count chip */}
      {invoice._count?.reminders > 0 && (
        <span
          className="absolute top-3 right-10 text-[10px] font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {invoice._count.reminders} reminder{invoice._count.reminders !== 1 ? "s" : ""} sent
        </span>
      )}
    </div>
  );
}