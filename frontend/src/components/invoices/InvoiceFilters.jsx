import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { INVOICE_STATUS } from "@/lib/constants";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

const SORT_OPTIONS = [
  { value: "dueDate_asc", label: "Due Date (Earliest)" },
  { value: "dueDate_desc", label: "Due Date (Latest)" },
  { value: "amount_asc", label: "Amount (Low → High)" },
  { value: "amount_desc", label: "Amount (High → Low)" },
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
];

/**
 * InvoiceFilters
 * @param {object} filters - { search, statuses[], sortBy }
 * @param {function} onFiltersChange
 */
export default function InvoiceFilters({ filters, onFiltersChange, className }) {
  const { search = "", statuses = [], sortBy = "createdAt_desc" } = filters ?? {};

  const activeFilterCount = statuses.length + (sortBy !== "createdAt_desc" ? 1 : 0);

  function handleSearch(e) {
    onFiltersChange({ ...filters, search: e.target.value });
  }

  function clearSearch() {
    onFiltersChange({ ...filters, search: "" });
  }

  function toggleStatus(val) {
    const next = statuses.includes(val)
      ? statuses.filter((s) => s !== val)
      : [...statuses, val];
    onFiltersChange({ ...filters, statuses: next });
  }

  function handleSort(val) {
    onFiltersChange({ ...filters, sortBy: val });
  }

  function clearAll() {
    onFiltersChange({ search: "", statuses: [], sortBy: "createdAt_desc" });
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search by client or email…"
          className="pl-9 pr-8 h-9 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-0 rounded-lg"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-sm border-slate-200 bg-white hover:bg-slate-50",
                activeFilterCount > 0 && "border-slate-400 bg-slate-50"
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-slate-500 font-normal uppercase tracking-wider">
              Status
            </DropdownMenuLabel>
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={statuses.includes(opt.value)}
                onCheckedChange={() => toggleStatus(opt.value)}
                className="text-sm"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-slate-500 font-normal uppercase tracking-wider">
              Sort by
            </DropdownMenuLabel>
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={sortBy === opt.value}
                onCheckedChange={() => handleSort(opt.value)}
                className="text-sm"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={clearAll}
                  className="w-full text-left px-2 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  Clear all filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active filters pill strip */}
        {statuses.length > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
                <X size={10} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}