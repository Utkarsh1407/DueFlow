// ─── String Utils ──────────────────────────────────────────────────────────────

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Convert snake_case or SCREAMING_SNAKE to Title Case.
 * @param {string} str
 * @returns {string}
 */
export const snakeToTitle = (str = "") =>
  str
    .toLowerCase()
    .split("_")
    .map(capitalize)
    .join(" ");

/**
 * Truncate a string to maxLen characters, appending ellipsis if needed.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str = "", maxLen = 50) =>
  str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;

/**
 * Generate initials from a full name (up to 2 characters).
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Slugify a string for use in URLs.
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ─── Array & Object Utils ─────────────────────────────────────────────────────

/**
 * Remove duplicate values from an array (primitives).
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export const unique = (arr) => [...new Set(arr)];

/**
 * Group an array of objects by a key.
 * @template T
 * @param {T[]} arr
 * @param {keyof T} key
 * @returns {Record<string, T[]>}
 */
export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = String(item[key] ?? "unknown");
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

/**
 * Sort an array of objects by a key (ascending by default).
 * @template T
 * @param {T[]} arr
 * @param {keyof T} key
 * @param {"asc"|"desc"} direction
 * @returns {T[]}
 */
export const sortBy = (arr, key, direction = "asc") => {
  const mult = direction === "desc" ? -1 : 1;
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return -1 * mult;
    if (a[key] > b[key]) return 1 * mult;
    return 0;
  });
};

/**
 * Pick specific keys from an object.
 * @template T
 * @param {T} obj
 * @param {(keyof T)[]} keys
 * @returns {Partial<T>}
 */
export const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

/**
 * Omit specific keys from an object.
 * @template T
 * @param {T} obj
 * @param {(keyof T)[]} keys
 * @returns {Partial<T>}
 */
export const omit = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k))
  );

// ─── Class / Style Utils ──────────────────────────────────────────────────────

/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx when you don't want the dep.
 * @param {...(string|undefined|null|false)} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Async / Promise Utils ────────────────────────────────────────────────────

/**
 * Wrap a promise so it never throws — returns [data, null] or [null, error].
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<[T, null] | [null, Error]>}
 */
export const safeAsync = async (promise) => {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err];
  }
};

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay  ms
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Misc ─────────────────────────────────────────────────────────────────────

/**
 * Generate a random hex color — useful for avatar backgrounds.
 * @returns {string}  e.g. "#a3b4c5"
 */
export const randomHexColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

/**
 * Deterministically pick a color from a palette based on a string key.
 * Useful for stable avatar / tag colors.
 * @param {string} str
 * @param {string[]} palette
 * @returns {string}
 */
export const colorFromString = (
  str = "",
  palette = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#0ea5e9",
  ]
) => {
  const hash = [...str].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

/**
 * Check if a value is a plain object (not null, array, or class instance).
 * @param {unknown} val
 * @returns {boolean}
 */
export const isPlainObject = (val) =>
  val !== null &&
  typeof val === "object" &&
  Object.getPrototypeOf(val) === Object.prototype;

/**
 * Deep clone a JSON-serialisable value.
 * @template T
 * @param {T} val
 * @returns {T}
 */
export const deepClone = (val) => JSON.parse(JSON.stringify(val));

export function downloadCSV(data = [], filename = "invoices.csv") {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);

  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((field) => JSON.stringify(row[field] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}