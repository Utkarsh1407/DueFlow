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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <AlertTriangle size={18} className="text-red-600" />
            </span>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Delete Invoice
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500 leading-relaxed pl-[52px]">
            Are you sure you want to delete the invoice for{" "}
            <span className="font-medium text-slate-700">{invoice?.clientName}</span>
            {invoice?.amount ? (
              <>
                {" "}
                worth{" "}
                <span className="font-medium text-slate-700">
                  ${Number(invoice.amount).toLocaleString()}
                </span>
              </>
            ) : null}
            ? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Warning note */}
        <div className="mx-1 rounded-lg bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-xs text-amber-700 leading-relaxed">
          All reminder history and activity logs for this invoice will also be deleted.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 sm:flex-none gap-1.5"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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