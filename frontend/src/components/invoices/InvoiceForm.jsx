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
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Input with icon ──────────────────────────────────────────────────────────

function IconInput({ icon: Icon, error, className, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <Input
        {...props}
        className={cn(
          "pl-9 h-9 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-0 rounded-lg transition-colors",
          error && "border-red-300 focus:border-red-400 bg-red-50/30",
          className
        )}
      />
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
        icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      });
      navigate("/invoices");
    } catch (err) {
      toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice", {
        description: err?.response?.data?.message ?? "Please check your inputs and try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Client Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">Who is this invoice for?</p>
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
          </div>

          {/* Invoice details card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Invoice Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">Amount, due date, and payment status.</p>
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

            <FormField label="Notes / Description" error={errors.notes?.message} hint="Optional — appears in reminder emails">
              <div className="relative">
                <FileText
                  size={14}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <Textarea
                  placeholder="Payment for services rendered in Q4 2024…"
                  rows={3}
                  className={cn(
                    "pl-9 text-sm resize-none bg-white border-slate-200 focus:border-slate-400 focus:ring-0 rounded-lg",
                    errors.notes && "border-red-300 bg-red-50/30"
                  )}
                  {...register("notes")}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          {/* Status card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Payment Status</h2>
            <FormField label="Status" required error={errors.status?.message}>
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v, { shouldDirty: true })}
              >
                <SelectTrigger
                  className={cn(
                    "h-9 text-sm border-slate-200 bg-white focus:ring-0",
                    status === "PAID" && "text-emerald-700 border-emerald-200 bg-emerald-50",
                    status === "OVERDUE" && "text-red-700 border-red-200 bg-red-50",
                    status === "PENDING" && "text-amber-700 border-amber-200 bg-amber-50"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  </SelectItem>
                  <SelectItem value="PAID" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Paid
                    </span>
                  </SelectItem>
                  <SelectItem value="OVERDUE" className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Overdue
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {status === "PAID" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-xs text-emerald-700 flex items-start gap-2">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                <span>Marking as paid will stop all future reminders for this invoice.</span>
              </div>
            )}
          </div>

          {/* Actions card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 gap-1.5 text-sm font-medium bg-slate-900 hover:bg-slate-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
              className="w-full h-9 gap-1.5 text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={13} />
              Cancel
            </Button>
          </div>

          {isEditing && (
            <p className="text-xs text-slate-400 text-center px-1">
              {isDirty
                ? "You have unsaved changes."
                : "No changes made yet."}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}