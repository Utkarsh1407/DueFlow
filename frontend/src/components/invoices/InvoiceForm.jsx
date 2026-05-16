import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Mail,
  DollarSign,
  CalendarDays,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ─── Validation schema ────────────────────────────────────────────────────────

const invoiceSchema = z.object({
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name too long"),
  clientEmail: z.string().email("Please enter a valid email address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  notes: z.string().max(1000, "Notes too long").optional(),
});

// ─── Field wrapper ────────────────────────────────────────────────────────────

function FormField({ label, error, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label
        className="text-sm font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-overdue)" }} className="ml-0.5">*</span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium" style={{ color: "var(--color-overdue-text)" }}>{error}</p>
      )}
    </div>
  );
}

// ─── Input with icon ──────────────────────────────────────────────────────────

function IconInput({ icon: Icon, error, className, style, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--color-text-muted)" }}
      />
      <Input
        {...props}
        className={cn("pl-9 h-9 text-sm rounded-lg transition-colors focus:ring-0", className)}
        style={{
          backgroundColor: error ? "var(--color-overdue-bg)" : "var(--color-bg-card)",
          borderColor: error ? "var(--color-overdue)" : "var(--color-border)",
          color: "var(--color-text-primary)",
          ...style,
        }}
      />
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function Card({ children, className }) {
  return (
    <div
      className={cn("rounded-xl border p-6 shadow-sm space-y-5", className)}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * InvoiceForm
 * @param {object|null} defaultValues - existing invoice for edit mode
 * @param {function} onSubmit - async (data) => void
 * @param {boolean} isEditing
 */
export default function InvoiceForm({ defaultValues, onSubmit, isEditing = false }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: defaultValues?.clientName ?? "",
      clientEmail: defaultValues?.clientEmail ?? "",
      amount: defaultValues?.amount ? String(defaultValues.amount) : "",
      dueDate: defaultValues?.dueDate
        ? format(new Date(defaultValues.dueDate), "yyyy-MM-dd")
        : "",
      status: defaultValues?.status ?? "PENDING",
      notes: defaultValues?.notes ?? "",
    },
  });

  const status = watch("status");

  async function handleFormSubmit(data) {
    try {
      await onSubmit({ ...data, amount: parseFloat(data.amount) });
      toast.success(isEditing ? "Invoice updated" : "Invoice created", {
        description: isEditing
          ? "Your changes have been saved."
          : `Invoice for ${data.clientName} has been created.`,
        icon: <CheckCircle2 size={16} style={{ color: "var(--color-paid)" }} />,
      });
      navigate("/dashboard/invoices");
    } catch (err) {
      toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice", {
        description: err?.response?.data?.message ?? "Please check your inputs and try again.",
      });
    }
  }

  // Derive status-based select styles
  const statusStyle = {
    PAID: {
      color: "var(--color-paid-text)",
      borderColor: "var(--color-paid)",
      backgroundColor: "var(--color-paid-bg)",
    },
    OVERDUE: {
      color: "var(--color-overdue-text)",
      borderColor: "var(--color-overdue)",
      backgroundColor: "var(--color-overdue-bg)",
    },
    PENDING: {
      color: "var(--color-pending-text)",
      borderColor: "var(--color-pending)",
      backgroundColor: "var(--color-pending-bg)",
    },
  }[status] ?? {};

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info card */}
          <Card>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Client Information
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Who is this invoice for?
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Client Name" required error={errors.clientName?.message}>
                <IconInput
                  icon={User}
                  placeholder="Acme Corporation"
                  error={errors.clientName}
                  {...register("clientName")}
                />
              </FormField>

              <FormField label="Client Email" required error={errors.clientEmail?.message}>
                <IconInput
                  icon={Mail}
                  type="email"
                  placeholder="billing@acme.com"
                  error={errors.clientEmail}
                  {...register("clientEmail")}
                />
              </FormField>
            </div>
          </Card>

          {/* Invoice details card */}
          <Card>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Invoice Details
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Amount, due date, and payment status.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Amount"
                required
                error={errors.amount?.message}
                hint="Enter the total amount to invoice"
              >
                <IconInput
                  icon={DollarSign}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={errors.amount}
                  {...register("amount")}
                />
              </FormField>

              <FormField label="Due Date" required error={errors.dueDate?.message}>
                <IconInput
                  icon={CalendarDays}
                  type="date"
                  error={errors.dueDate}
                  {...register("dueDate")}
                />
              </FormField>
            </div>

            <FormField
              label="Notes / Description"
              error={errors.notes?.message}
              hint="Optional — appears in reminder emails"
            >
              <div className="relative">
                <FileText
                  size={14}
                  className="absolute left-3 top-3 pointer-events-none"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <Textarea
                  placeholder="Payment for services rendered in Q4 2024…"
                  rows={3}
                  className="pl-9 text-sm resize-none rounded-lg focus:ring-0"
                  style={{
                    backgroundColor: errors.notes ? "var(--color-overdue-bg)" : "var(--color-bg-card)",
                    borderColor: errors.notes ? "var(--color-overdue)" : "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  {...register("notes")}
                />
              </div>
            </FormField>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          {/* Status card */}
          <div
            className="rounded-xl border p-5 shadow-sm space-y-4"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Payment Status
            </h2>
            <FormField label="Status" required error={errors.status?.message}>
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v, { shouldDirty: true })}
              >
                <SelectTrigger
                  className="h-9 text-sm focus:ring-0"
                  style={statusStyle}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "var(--color-bg-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <SelectItem value="PENDING" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "var(--color-pending)" }}
                      />
                      Pending
                    </span>
                  </SelectItem>
                  <SelectItem value="PAID" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "var(--color-paid)" }}
                      />
                      Paid
                    </span>
                  </SelectItem>
                  <SelectItem value="OVERDUE" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "var(--color-overdue)" }}
                      />
                      Overdue
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {status === "PAID" && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs flex items-start gap-2 border"
                style={{
                  backgroundColor: "var(--color-paid-bg)",
                  borderColor: "var(--color-paid)",
                  color: "var(--color-paid-text)",
                }}
              >
                <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                <span>Marking as paid will stop all future reminders for this invoice.</span>
              </div>
            )}
          </div>

          {/* Actions card */}
          <div
            className="rounded-xl border p-5 shadow-sm space-y-2.5"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 gap-1.5 text-sm font-medium"
              style={{
                backgroundColor: "var(--color-brand)",
                color: "var(--color-brand-accent)",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: "rgba(255,255,255,0.3)",
                      borderTopColor: "var(--color-brand-accent)",
                    }}
                  />
                  {isEditing ? "Saving…" : "Creating…"}
                </>
              ) : (
                <>
                  <Save size={13} />
                  {isEditing ? "Save Changes" : "Create Invoice"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="w-full h-9 gap-1.5 text-sm"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              <ArrowLeft size={13} />
              Cancel
            </Button>
          </div>

          {isEditing && (
            <p className="text-xs text-center px-1" style={{ color: "var(--color-text-muted)" }}>
              {isDirty ? "You have unsaved changes." : "No changes made yet."}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}