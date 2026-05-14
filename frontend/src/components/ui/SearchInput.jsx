// components/ui/SearchInput.jsx

/**
 * SearchInput — debounced search input for DueFlow
 *
 * Usage:
 *   // Controlled (recommended)
 *   const [q, setQ] = useState('');
 *   <SearchInput value={q} onChange={setQ} placeholder="Search invoices…" />
 *
 *   // With debounce handled internally
 *   <SearchInput
 *     onDebouncedChange={handleSearch}
 *     debounceMs={300}
 *     placeholder="Search by client name or email…"
 *   />
 *
 *   // With icon slot and keyboard shortcut hint
 *   <SearchInput
 *     value={q}
 *     onChange={setQ}
 *     shortcut="⌘K"
 *     loading={isFetching}
 *   />
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { Search, X, Loader2 } from "lucide-react";

// ─── Utility: debounce ────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── Size Config ──────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm: {
    input: "h-8 text-sm pl-8 pr-3",
    icon: "w-4 h-4 left-2",
    clear: "right-2",
    clearIcon: "w-3.5 h-3.5",
    shortcut: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    input: "h-9 text-sm pl-9 pr-3",
    icon: "w-4 h-4 left-2.5",
    clear: "right-2.5",
    clearIcon: "w-4 h-4",
    shortcut: "text-xs px-1.5 py-0.5",
  },
  lg: {
    input: "h-11 text-base pl-10 pr-4",
    icon: "w-5 h-5 left-3",
    clear: "right-3",
    clearIcon: "w-4 h-4",
    shortcut: "text-xs px-2 py-1",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SearchInput = forwardRef(function SearchInput(
  {
    // Controlled
    value: externalValue,
    onChange,

    // Debounced callback (alternative to onChange)
    onDebouncedChange,
    debounceMs = 300,

    // UI
    placeholder = "Search…",
    loading = false,
    disabled = false,
    size = "md",

    // Keyboard shortcut hint (e.g. "⌘K", "/")
    shortcut,

    // Allow auto-focus
    autoFocus = false,

    // Global keyboard shortcut to focus input (e.g. '/')
    focusKey,

    // Styling
    className = "",
    containerClassName = "",
  },
  ref
) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  // Internal state if uncontrolled
  const [internalValue, setInternalValue] = useState("");
  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const inputRef = useRef(null);
  const combinedRef = (node) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange?.("");
    onDebouncedChange?.("");
    inputRef.current?.focus();
  };

  // Debounce for the async callback
  const debouncedValue = useDebounce(value, debounceMs);
  useEffect(() => {
    if (onDebouncedChange !== undefined) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue]); // eslint-disable-line

  // Global focus key (e.g. press "/" to focus)
  const handleGlobalKey = useCallback(
    (e) => {
      if (!focusKey) return;
      if (
        e.key === focusKey &&
        document.activeElement !== inputRef.current &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [focusKey]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  const showClear = value.length > 0 && !loading;
  const showShortcut = shortcut && value.length === 0 && !loading;

  return (
    <div className={`relative flex items-center group ${containerClassName}`}>
      {/* Search icon / spinner */}
      <div
        className={`absolute ${s.icon} top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
          value.length > 0 ? "text-blue-400" : "text-zinc-500 group-focus-within:text-zinc-400"
        }`}
      >
        {loading ? (
          <Loader2 className={`${s.clearIcon} animate-spin`} />
        ) : (
          <Search className={s.icon.includes("w-5") ? "w-5 h-5" : "w-4 h-4"} />
        )}
      </div>

      {/* Input */}
      <input
        ref={combinedRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        aria-label={placeholder}
        className={`
          w-full rounded-lg
          bg-zinc-900 border border-zinc-800
          text-zinc-100 placeholder:text-zinc-500
          transition-all duration-150
          focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600
          hover:border-zinc-700
          disabled:opacity-50 disabled:cursor-not-allowed
          [&::-webkit-search-cancel-button]:hidden
          ${s.input}
          ${showClear || showShortcut ? "pr-16" : ""}
          ${className}
        `}
      />

      {/* Right slot: Clear button OR shortcut hint */}
      <div className={`absolute ${s.clear} top-1/2 -translate-y-1/2 flex items-center gap-1`}>
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={`
              ${s.clearIcon} p-0.5 rounded
              text-zinc-500 hover:text-zinc-300
              bg-transparent hover:bg-zinc-800
              transition-colors duration-100
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500
            `}
          >
            <X className="w-full h-full" />
          </button>
        )}

        {showShortcut && (
          <kbd
            className={`
              ${s.shortcut} rounded
              font-mono text-zinc-500
              bg-zinc-800 border border-zinc-700
              leading-none pointer-events-none select-none
            `}
          >
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
});

export default SearchInput;

// ─── Compound: SearchBar with result count ────────────────────────────────────
/**
 * SearchBar — wraps SearchInput with an optional result-count label
 *
 * <SearchBar
 *   value={q}
 *   onChange={setQ}
 *   count={filteredInvoices.length}
 *   total={invoices.length}
 *   placeholder="Search invoices…"
 * />
 */
export function SearchBar({
  value,
  onChange,
  count,
  total,
  loading,
  placeholder,
  className = "",
  ...rest
}) {
  const showCount = count !== undefined && value && value.length > 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SearchInput
        value={value}
        onChange={onChange}
        loading={loading}
        placeholder={placeholder}
        className="flex-1"
        {...rest}
      />

      {showCount && (
        <span className="flex-shrink-0 text-xs text-zinc-500 whitespace-nowrap">
          {count === 0 ? "No results" : `${count}${total !== undefined ? ` of ${total}` : ""} result${count !== 1 ? "s" : ""}`}
        </span>
      )}
    </div>
  );
}

// ─── Inline search chip row ───────────────────────────────────────────────────
/**
 * SearchChips — renders active search/filter tags below the search bar
 *
 * <SearchChips
 *   chips={[
 *     { label: 'Status: Overdue', onRemove: () => setStatus(null) },
 *     { label: 'q: acme', onRemove: () => setQ('') },
 *   ]}
 *   onClearAll={clearAll}
 * />
 */
export function SearchChips({ chips = [], onClearAll }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-zinc-500">Filtered by:</span>

      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {chips.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}