import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * DeleteDialog
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {object} invoice - the invoice to delete
 * @param {function} onConfirm - async delete handler
 */
export default function DeleteDialog({ open, onOpenChange, invoice, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm(invoice.id);
      toast.success("Invoice deleted", {
        description: `Invoice for ${invoice.clientName} has been removed.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to delete invoice", {
        description: err?.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border"
              style={{
                backgroundColor: "var(--color-overdue-bg)",
                borderColor: "var(--color-overdue)",
              }}
            >
              <AlertTriangle size={18} style={{ color: "var(--color-overdue-text)" }} />
            </span>
            <DialogTitle
              className="text-base font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Delete Invoice
            </DialogTitle>
          </div>
          <DialogDescription
            className="text-sm leading-relaxed pl-[52px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Are you sure you want to delete the invoice for{" "}
            <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              {invoice?.clientName}
            </span>
            {invoice?.amount ? (
              <>
                {" "}worth{" "}
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  ${Number(invoice.amount).toLocaleString()}
                </span>
              </>
            ) : null}
            ? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Warning note */}
        <div
          className="mx-1 rounded-lg px-3.5 py-2.5 text-xs leading-relaxed border"
          style={{
            backgroundColor: "var(--color-pending-bg)",
            borderColor: "var(--color-pending)",
            color: "var(--color-pending-text)",
          }}
        >
          All reminder history and activity logs for this invoice will also be deleted.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-bg-card)",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 sm:flex-none gap-1.5"
            style={{
              backgroundColor: "var(--color-overdue)",
              color: "#fff",
            }}
          >
            {loading ? (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                  }}
                />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Delete Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}