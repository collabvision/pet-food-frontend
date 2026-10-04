"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, AlertCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Reusable Custom Dropdown (State / City / etc.)
   Props:
     options    - string[] list of options
     value      - current selected value (string)
     onChange   - (value: string) => void
     placeholder - placeholder text
     label      - field label
     required   - shows * indicator
     error      - error message string (shows red ring if truthy)
     searchable - whether to show search input inside dropdown
     disabled   - disable the dropdown
───────────────────────────────────────────────────────────── */
export function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  required = false,
  error,
  searchable = true,
  disabled = false,
  className = "",
  accentColor = "orange", // "orange" | "blue"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const accent =
    accentColor === "blue"
      ? {
          ring: "focus-within:ring-[#142653]/10 focus-within:border-[#142653]",
          item: "hover:bg-[#142653]/5 focus:bg-[#142653]/5",
          selected: "bg-[#142653]/10 text-[#142653]",
          check: "text-[#142653]",
          badge: "bg-[#142653]",
        }
      : {
          ring: "focus-within:ring-[#ff6f4d]/10 focus-within:border-[#ff6f4d]",
          item: "hover:bg-[#ff6f4d]/5",
          selected: "bg-orange-50 text-[#ff6f4d]",
          check: "text-[#ff6f4d]",
          badge: "bg-[#ff6f4d]",
        };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
  };

  const borderClass = error
    ? "border-red-400 ring-2 ring-red-100"
    : open
    ? `border-[#ff6f4d] ring-2 ring-[#ff6f4d]/20`
    : "border-gray-200";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between bg-white border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${borderClass} ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={value ? "text-[#142653]" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && (
        <p className="flex items-center gap-1 mt-1 ml-1 text-xs font-semibold text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}

      {open && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {searchable && (
            <div className="px-3 pt-2.5 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-xs font-medium text-[#142653] outline-none placeholder:text-gray-400 min-w-0"
                />
              </div>
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">
                No results found
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                      opt === value ? accent.selected : `text-[#142653] ${accent.item}`
                    }`}
                  >
                    {opt}
                    {opt === value && (
                      <Check className={`w-4 h-4 ${accent.check} flex-shrink-0`} />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FormField — validated input with red border + error message
   Props:
     label, required, error, type, value, onChange,
     placeholder, maxLength, inputMode, pattern, disabled
───────────────────────────────────────────────────────────── */
export function FormField({
  label,
  required = false,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
  pattern,
  disabled = false,
  className = "",
  accentColor = "orange",
}) {
  const focusBorder =
    accentColor === "blue"
      ? "focus:border-[#142653] focus:ring-2 focus:ring-[#142653]/10"
      : "focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20";

  const borderClass = error ? "border-red-400 ring-2 ring-red-100" : `border-gray-200 ${focusBorder}`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        disabled={disabled}
        className={`w-full bg-white border rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium text-[#142653] placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${borderClass}`}
      />
      {error && (
        <p className="flex items-center gap-1 mt-1 ml-1 text-xs font-semibold text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
