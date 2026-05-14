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
        "group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300",
        invoice.status === "OVERDUE" && "border-red-100 bg-red-50/20",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/invoices/${invoice.id}`}
            className="block font-semibold text-slate-900 text-sm truncate hover:text-slate-600 transition-colors"
          >
            {invoice.clientName}
          </Link>
          <p className="text-xs text-slate-400 truncate mt-0.5">{invoice.clientEmail}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={invoice.status} size="sm" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-700 -mr-1"
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link to={`/invoices/${invoice.id}`} className="flex items-center gap-2 text-sm">
                  <Eye size={13} />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/invoices/${invoice.id}/edit`} className="flex items-center gap-2 text-sm">
                  <Pencil size={13} />
                  Edit
                </Link>
              </DropdownMenuItem>
              {invoice.status !== "PAID" && (
                <DropdownMenuItem
                  onClick={handleRemind}
                  className="flex items-center gap-2 text-sm"
                >
                  <Bell size={13} />
                  Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(invoice);
                }}
                className="flex items-center gap-2 text-sm text-red-600 focus:text-red-700 focus:bg-red-50"
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
          <p className="text-xs text-slate-400 mb-0.5">Amount</p>
          <p className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(invoice.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Issued</p>
          <p className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <DueDateLabel dueDate={invoice.dueDate} status={invoice.status} variant="full" />

        {invoice.status !== "PAID" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemind}
            disabled={reminding}
            className="h-7 text-xs gap-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2"
          >
            {reminding ? (
              <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
            ) : (
              <Bell size={11} />
            )}
            Remind
          </Button>
        )}
      </div>

      {/* Reminder count chip */}
      {invoice._count?.reminders > 0 && (
        <span className="absolute top-3 right-10 text-[10px] text-slate-400 font-medium">
          {invoice._count.reminders} reminder{invoice._count.reminders !== 1 ? "s" : ""} sent
        </span>
      )}
    </div>
  );
}