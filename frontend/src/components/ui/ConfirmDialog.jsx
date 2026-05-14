// components/ui/ConfirmDialog.jsx

/**
 * ConfirmDialog — accessible modal dialog for dangerous actions in DueFlow
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *
 *   <ConfirmDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *     variant="danger"
 *     title="Delete Invoice"
 *     description="This will permanently delete the invoice for Acme Corp ($4,200). This action cannot be undone."
 *     confirmLabel="Delete Invoice"
 *     loading={isDeleting}
 *   />
 */

import { useEffect, useRef, useCallback } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  CheckCircle2,
  LogOut,
  AlertCircle,
} from "lucide-react";

// ─── Variant Config ───────────────────────────────────────────────────────────
const VARIANTS = {
  danger: {
    icon: <Trash2 className="w-5 h-5" />,
    iconWrapClass: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    confirmClass:
      "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500 text-white",
    accentColor: "text-red-400",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    iconWrapClass: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    confirmClass:
      "bg-amber-500 hover:bg-amber-400 focus-visible:ring-amber-400 text-black",
    accentColor: "text-amber-400",
  },
  confirm: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    iconWrapClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    confirmClass:
      "bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500 text-white",
    accentColor: "text-emerald-400",
  },
  logout: {
    icon: <LogOut className="w-5 h-5" />,
    iconWrapClass: "bg-zinc-700 text-zinc-300 ring-1 ring-zinc-600",
    confirmClass:
      "bg-zinc-700 hover:bg-zinc-600 focus-visible:ring-zinc-500 text-white",
    accentColor: "text-zinc-300",
  },
  info: {
    icon: <AlertCircle className="w-5 h-5" />,
    iconWrapClass: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
    confirmClass:
      "bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-500 text-white",
    accentColor: "text-blue-400",
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────
function Backdrop({ onClick }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      aria-hidden="true"
      onClick={onClick}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  variant = "danger",
  title = "Are you sure?",
  description,
  // Highlight a key detail (e.g. invoice number, client name)
  detail,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  // Prevent closing while confirming
  preventClose = false,
}) {
  const v = VARIANTS[variant] || VARIANTS.danger;
  const confirmRef = useRef(null);
  const dialogRef = useRef(null);

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => confirmRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Trap focus within dialog
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;

      if (e.key === "Escape" && !preventClose && !loading) {
        onClose();
      }

      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open, loading, preventClose, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!preventClose && !loading) onClose();
  };

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm?.();
  };

  return (
    <>
      <Backdrop onClick={handleBackdropClick} />

      {/* Dialog panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby={description ? "confirm-dialog-desc" : undefined}
          className="
            relative w-full max-w-md
            rounded-2xl border border-zinc-800
            bg-zinc-900 shadow-2xl shadow-black/60
            animate-[dialogIn_0.18s_ease-out]
          "
          style={{
            // Inline keyframe fallback for environments without tailwind config
          }}
        >
          {/* Close button */}
          {!preventClose && !loading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="p-6 flex flex-col gap-5">
            {/* Icon + Title */}
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${v.iconWrapClass}`}
              >
                {v.icon}
              </div>

              <div className="flex flex-col gap-1.5 pt-0.5">
                <h2
                  id="confirm-dialog-title"
                  className="text-base font-semibold text-zinc-100"
                >
                  {title}
                </h2>

                {description && (
                  <p
                    id="confirm-dialog-desc"
                    className="text-sm text-zinc-400 leading-relaxed"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Optional detail highlight */}
            {detail && (
              <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-4 py-3">
                <p className="text-sm text-zinc-300 font-medium">{detail}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading || preventClose}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  text-zinc-400 hover:text-zinc-200
                  bg-zinc-800/60 hover:bg-zinc-800
                  border border-zinc-700/50
                  transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500
                "
              >
                {cancelLabel}
              </button>

              <button
                ref={confirmRef}
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  inline-flex items-center gap-2
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
                  ${v.confirmClass}
                `}
              >
                {loading && <Spinner />}
                {loading ? "Processing…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inject animation keyframe */}
      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ─── Hook for convenience ──────────────────────────────────────────────────────
/**
 * useConfirmDialog — manages open state for ConfirmDialog
 *
 * const { dialogProps, openDialog } = useConfirmDialog({
 *   onConfirm: handleDelete,
 *   variant: 'danger',
 *   title: 'Delete Invoice',
 *   description: '...',
 * });
 * ...
 * <button onClick={() => openDialog()}>Delete</button>
 * <ConfirmDialog {...dialogProps} />
 */
import { useState } from "react";

export function useConfirmDialog({ onConfirm, ...props }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return {
    openDialog,
    dialogProps: {
      ...props,
      open,
      onClose: closeDialog,
      onConfirm: handleConfirm,
      loading,
    },
  };
}